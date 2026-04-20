# Common UMG Pitfalls

Detailed explanations of frequent mistakes and their solutions.

## 1. Constructor vs NativeConstruct

**Wrong:**
```cpp
UUW_MyWidget::UUW_MyWidget(const FObjectInitializer& ObjectInitializer)
    : Super(ObjectInitializer)
{
    // DON'T: Slate widget doesn't exist yet
    if (MyButton)
    {
        MyButton->SetVisibility(ESlateVisibility::Collapsed);
    }
}
```

**Right:**
```cpp
void UUW_MyWidget::NativeConstruct()
{
    Super::NativeConstruct();
    // Slate widget is guaranteed to exist here
    if (MyButton)
    {
        MyButton->SetVisibility(ESlateVisibility::Collapsed);
    }
}
```

## 2. Memory Leaks with Widget Pools

**Problem:** `FUserWidgetPool` caches Slate widgets. Without proper cleanup,
circular references prevent garbage collection.

**Solution:**
```cpp
void UUW_MyContainer::ReleaseSlateResources(bool bReleaseChildren)
{
    WidgetPool.ReleaseAllSlateResources();
    Super::ReleaseSlateResources(bReleaseChildren);
}
```

## 3. Input Mode Confusion

| Symptom | Cause | Fix |
|---------|-------|-----|
| Mouse clicks pass through UI to game | `GameOnly` input mode | Set `UIOnly` or `GameAndUI` |
| Can't move character with UI open | `UIOnly` mode | Use `GameAndUI` or close UI |
| Gamepad doesn't navigate UI | No focus set | Call `SetUserFocus()` explicitly |
| Mouse cursor disappears | `bShowMouseCursor = false` | Set to `true` for UI modes |

## 4. BindWidget Silent Failures

**Symptoms:** Null pointer when accessing BindWidget property, even though
component exists in Blueprint.

**Causes:**
1. Name mismatch (case-sensitive): `HealthBar` vs `healthBar`
2. Component added after C++ compilation — recompile C++
3. Component in wrong widget (child instead of this widget)
4. Using `BindWidget` on component in child user widget

**Debug:**
```cpp
void UUW_MyWidget::NativeConstruct()
{
    Super::NativeConstruct();

    UE_LOG(LogTemp, Warning, TEXT("HealthBar: %s"),
        HealthBar ? TEXT("Valid") : TEXT("NULL"));
}
```

## 5. Delegate Dangling References

**Problem:** Widget subscribes to GameMode/PlayerState delegate but doesn't
unsubscribe when destroyed. Crashes when delegate fires.

**Solution:** Always unbind in `NativeDestruct()`:
```cpp
void UUW_MyWidget::NativeDestruct()
{
    if (TargetObject)
    {
        TargetObject->OnEvent.RemoveDynamic(this, &UUW_MyWidget::Handler);
    }
    Super::NativeDestruct();
}
```

## 6. Tick Abuse

**Wrong:**
```cpp
void UUW_MyWidget::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
    Super::NativeTick(MyGeometry, InDeltaTime);

    // Polling every frame — expensive!
    if (APlayerState* PS = GetOwningPlayerState())
    {
        UpdateScore(PS->GetScore());
    }
}
```

**Right:**
```cpp
void UUW_MyWidget::NativeConstruct()
{
    Super::NativeConstruct();

    // Subscribe to event — only runs when data changes
    if (AMyPlayerState* PS = GetOwningPlayerState<AMyPlayerState>())
    {
        PS->OnScoreChanged.AddDynamic(this, &UUW_MyWidget::UpdateScore);
    }
}
```

## 7. Z-Order / Layering Issues

**Problem:** Widget appears behind other widgets.

**Solutions:**
- `AddToViewport(ZOrder)`: Higher number = closer to camera
- Use `UWidgetSwitcher` for mutually exclusive content
- Set `ZOrder` on `AddToViewport()` call
- For world-space UI (WidgetComponent), check world position

## 8. Blueprint "Bind" Property Abuse

**Problem:** Using the "Bind" button next to widget properties in Blueprints.
These create functions that run every frame, even when the value hasn't changed.

**Why it's bad:**
- Called every frame (often unnecessary)
- Hard to find references (Find References doesn't show bound functions)
- Easy to accidentally add expensive logic
- Difficult to track down in large widgets

**Solution:** Use event-based updates instead:
```cpp
void UUW_MyWidget::NativeConstruct()
{
    Super::NativeConstruct();
    // Update once on construct, then via events
    UpdateDisplay();
}

// Call this when data changes, not every frame
void UUW_MyWidget::UpdateDisplay()
{
    if (HealthBar)
    {
        HealthBar->SetPercent(CurrentHealth / MaxHealth);
    }
}
```

## 9. WidgetSwitcher Bloat

**Problem:** All children of a `UWidgetSwitcher` are constructed at initialization,
even the hidden pages. This causes hitches when opening complex menus.

**Solution:** Lazy-instantiate heavy content:
```cpp
void UUW_MyWidget::ShowSettingsPage()
{
    if (!SettingsWidget)
    {
        SettingsWidget = CreateWidget<UUW_Settings>(this, SettingsClass);
        ContentSwitcher->AddChild(SettingsWidget);
    }
    ContentSwitcher->SetActiveWidget(SettingsWidget);
}
```

## 10. Hidden Widget Tick

**Problem:** Widgets that are Hidden or placed outside CanvasPanel bounds
do NOT receive tick events.

**Workaround:** Put the update logic in a visible parent widget and pass
data down, or use a custom timer in a visible widget.

## 11. SetVisibility Called Every Frame

**Problem:** Calling `SetVisibility()` every frame in Tick or with bound properties.

**Why it's bad:** SetVisibility isn't free — it triggers Slate layout updates
and can be surprisingly expensive.

**Solution:** Only call when visibility actually needs to change:
```cpp
void UUW_MyWidget::SetMenuVisible(bool bVisible)
{
    if (MenuPanel->GetVisibility() != (bVisible ? ESlateVisibility::Visible : ESlateVisibility::Collapsed))
    {
        MenuPanel->SetVisibility(bVisible ? ESlateVisibility::Visible : ESlateVisibility::Collapsed);
    }
}
```

## 12. FormatText in Tick

**Problem:** Calling `FText::Format()` every frame for localized text.

**Why it's bad:** FormatText can take ~0.04ms per call on console. In a HUD
with multiple text elements, this adds up quickly.

**Solution:** Cache the formatted text and only update when underlying data changes:
```cpp
void UUW_MyWidget::UpdateScoreText(int32 NewScore)
{
    if (Score != NewScore)
    {
        Score = NewScore;
        ScoreText->SetText(FText::Format(
            LOCTEXT("ScoreFormat", "Score: {0}"),
            FText::AsNumber(Score)));
    }
}
```
