# UMG C++ Patterns

Production-ready code snippets for common UMG tasks. Copy and adapt as needed.

## 1. BindWidget Setup

```cpp
// Header
UPROPERTY(meta = (BindWidget))
TObjectPtr<UProgressBar> HealthBar;

UPROPERTY(meta = (BindWidgetOptional))
TObjectPtr<UImage> OptionalIcon;  // Won't error if missing in Blueprint
```

```cpp
// NativeConstruct
if (HealthBar)
{
    HealthBar->SetPercent(1.0f);
}
```

## 2. BindWidgetAnim (Animation from C++)

```cpp
// Header — MUST be Transient in UE5+
UPROPERTY(Transient, meta = (BindWidgetAnim))
TObjectPtr<UWidgetAnimation> ShowAnim;

UPROPERTY(Transient, meta = (BindWidgetAnim))
TObjectPtr<UWidgetAnimation> HideAnim;
```

```cpp
void UUW_MyWidget::PlayShow()
{
    if (ShowAnim)
    {
        PlayAnimationForward(ShowAnim);
    }
}
```

## 3. UPROPERTY(Interp) for Animatable Properties

```cpp
UPROPERTY(Interp)
float GlowIntensity = 0.0f;

UPROPERTY(Interp)
FLinearColor TintColor = FLinearColor::White;

UPROPERTY(Interp)
FVector2D Offset;
```

## 4. Delegate Binding Pattern

```cpp
void UUW_MyWidget::NativeConstruct()
{
    Super::NativeConstruct();

    // Button click
    if (ActionButton)
    {
        ActionButton->OnClicked.AddDynamic(this, &UUW_MyWidget::OnActionClicked);
    }

    // Slider value change
    if (VolumeSlider)
    {
        VolumeSlider->OnValueChanged.AddDynamic(this, &UUW_MyWidget::OnVolumeChanged);
    }

    // Text input commit
    if (NameInput)
    {
        NameInput->OnTextCommitted.AddDynamic(this, &UUW_MyWidget::OnNameCommitted);
    }
}

void UUW_MyWidget::NativeDestruct()
{
    if (ActionButton)
    {
        ActionButton->OnClicked.RemoveDynamic(this, &UUW_MyWidget::OnActionClicked);
    }
    if (VolumeSlider)
    {
        VolumeSlider->OnValueChanged.RemoveDynamic(this, &UUW_MyWidget::OnVolumeChanged);
    }
    if (NameInput)
    {
        NameInput->OnTextCommitted.RemoveDynamic(this, &UUW_MyWidget::OnNameCommitted);
    }

    Super::NativeDestruct();
}
```

## 5. Creating and Showing Widgets

```cpp
// From PlayerController
void AMyPlayerController::CreateHUD()
{
    if (HUDWidgetClass && !HUDWidget)
    {
        HUDWidget = CreateWidget<UUW_HUD>(this, HUDWidgetClass);
        if (HUDWidget)
        {
            HUDWidget->AddToViewport(0);  // ZOrder 0
        }
    }
}

void AMyPlayerController::RemoveHUD()
{
    if (HUDWidget)
    {
        HUDWidget->RemoveFromParent();
        HUDWidget = nullptr;
    }
}
```

## 6. Widget Pooling

```cpp
// Header
#pragma once
#include "Blueprint/UserWidgetPool.h"
#include "Components/UserWidget.h"

UCLASS()
class MYGAME_API UUW_InventoryGrid : public UUserWidget
{
    GENERATED_BODY()

public:
    UUserWidget* GetOrCreateSlotWidget(TSubclassOf<UUserWidget> SlotClass);
    void ReturnSlotWidget(UUserWidget* SlotWidget);

protected:
    virtual void ReleaseSlateResources(bool bReleaseChildren) override;

private:
    FUserWidgetPool SlotPool;
};
```

```cpp
// Implementation
UUserWidget* UUW_InventoryGrid::GetOrCreateSlotWidget(TSubclassOf<UUserWidget> SlotClass)
{
    return SlotPool.GetOrCreateInstance<UUserWidget>(SlotClass);
}

void UUW_InventoryGrid::ReturnSlotWidget(UUserWidget* SlotWidget)
{
    if (SlotWidget)
    {
        SlotPool.Release(SlotWidget);
    }
}

void UUW_InventoryGrid::ReleaseSlateResources(bool bReleaseChildren)
{
    SlotPool.ReleaseAllSlateResources();
    Super::ReleaseSlateResources(bReleaseChildren);
}
```

## 7. ListView / TileView Pattern

```cpp
// Entry Widget
#pragma once
#include "Blueprint/UserWidget.h"
#include "Blueprint/IUserObjectListEntry.h"
#include "InventoryEntry.generated.h"

UCLASS(Abstract)
class UUW_InventoryEntry : public UUserWidget, public IUserObjectListEntry
{
    GENERATED_BODY()

protected:
    virtual void NativeOnListItemObjectSet(UObject* ListItemObject) override;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> NameLabel;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UImage> IconImage;
};
```

```cpp
#include "InventoryEntry.h"
#include "Components/Image.h"
#include "Components/TextBlock.h"

void UUW_InventoryEntry::NativeOnListItemObjectSet(UObject* ListItemObject)
{
    if (UInventoryItem* Item = Cast<UInventoryItem>(ListItemObject))
    {
        NameLabel->SetText(Item->DisplayName);
        IconImage->SetBrushFromTexture(Item->Icon);
    }
}
```

```cpp
// Panel Widget
UCLASS(Abstract)
class UUW_InventoryPanel : public UUserWidget
{
    GENERATED_BODY()

protected:
    virtual void NativeConstruct() override;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UListView> InventoryListView;
};
```

```cpp
void UUW_InventoryPanel::NativeConstruct()
{
    Super::NativeConstruct();
    InventoryListView->SetListItems(InventoryItems);
}
```

## 8. Animation Events

```cpp
void UUW_MyWidget::PlayExitAnimation()
{
    if (ExitAnim)
    {
        FWidgetAnimationDynamicEvent FinishedEvent;
        FinishedEvent.BindDynamic(this, &UUW_MyWidget::OnExitFinished);
        BindToAnimationFinished(ExitAnim, FinishedEvent);

        PlayAnimationReverse(ExitAnim);
    }
}

UFUNCTION()
void UUW_MyWidget::OnExitFinished()
{
    RemoveFromParent();
}
```

## 9. Data Binding with Delegates

```cpp
// From C++ base class — subscribe to game data changes
void UUW_HealthBar::NativeConstruct()
{
    Super::NativeConstruct();

    if (AMyPlayerState* PS = GetOwningPlayerState<AMyPlayerState>())
    {
        PS->OnHealthChanged.AddDynamic(this, &UUW_HealthBar::UpdateHealth);
        UpdateHealth(PS->GetHealth(), PS->GetMaxHealth());
    }
}

void UUW_HealthBar::NativeDestruct()
{
    if (AMyPlayerState* PS = GetOwningPlayerState<AMyPlayerState>())
    {
        PS->OnHealthChanged.RemoveDynamic(this, &UUW_HealthBar::UpdateHealth);
    }

    Super::NativeDestruct();
}

void UUW_HealthBar::UpdateHealth(float Current, float Max)
{
    if (HealthBar)
    {
        HealthBar->SetPercent(Current / Max);
    }
    if (HealthText)
    {
        HealthText->SetText(FText::FromString(FString::Printf(TEXT("%.0f / %.0f"), Current, Max)));
    }
}
```

## 10. Dynamic Material Instance in UI

```cpp
#pragma once
#include "Blueprint/UserWidget.h"
#include "MaterialWidget.generated.h"

UCLASS(Abstract)
class UUW_MaterialWidget : public UUserWidget
{
    GENERATED_BODY()

protected:
    virtual void NativeConstruct() override;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UImage> IconImage;

    UPROPERTY(EditDefaultsOnly)
    TObjectPtr<UMaterialInterface> IconMaterial;

    TObjectPtr<UMaterialInstanceDynamic> IconMaterialInstance;
};
```

```cpp
#include "MaterialWidget.h"

void UUW_MaterialWidget::NativeConstruct()
{
    Super::NativeConstruct();

    if (IconMaterial && IconImage)
    {
        IconMaterialInstance = UMaterialInstanceDynamic::Create(IconMaterial, this);
        IconImage->SetBrushFromMaterial(IconMaterialInstance);
        IconMaterialInstance->SetScalarParameterValue("Strength", 0.8f);
        IconMaterialInstance->SetVectorParameterValue("Color", FLinearColor::Red);
    }
}
```

## 11. In-World UI (WidgetComponent)

```cpp
// Actor header
UCLASS()
class AMyActor : public AActor
{
    GENERATED_BODY()

public:
    AMyActor(const FObjectInitializer& ObjectInitializer);

protected:
    virtual void BeginPlay() override;

    UPROPERTY(VisibleAnywhere)
    TObjectPtr<UWidgetComponent> HealthWidgetComp;
};
```

```cpp
// Actor cpp
AMyActor::AMyActor(const FObjectInitializer& ObjectInitializer)
    : Super(ObjectInitializer)
{
    HealthWidgetComp = ObjectInitializer.CreateDefaultSubobject<UWidgetComponent>(
        this, TEXT("HealthBar"));
    HealthWidgetComp->AttachToComponent(RootComponent,
        FAttachmentTransformRules::KeepRelativeTransform);
}

void AMyActor::BeginPlay()
{
    Super::BeginPlay();

    if (UUW_HealthBar* HealthBar = Cast<UUW_HealthBar>(
        HealthWidgetComp->GetUserWidgetObject()))
    {
        HealthBar->SetOwnerActor(this);
    }
}
```

```cpp
// Widget header — use TWeakObjectPtr for owner
UCLASS(Abstract)
class UUW_HealthBar : public UUserWidget
{
    GENERATED_BODY()

public:
    void SetOwnerActor(AMyActor* InActor) { OwnerActor = InActor; }

protected:
    virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

    TWeakObjectPtr<AMyActor> OwnerActor;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UProgressBar> HealthBar;
};
```

## 12. Lazy Asset Loading

```cpp
// Avoids loading DefaultObject at widget construction time
UPROPERTY(EditDefaultsOnly)
TAssetSubclassOf<UUserWidget> PopupWidgetClass;

// Avoids loading texture at widget construction time
UPROPERTY(EditDefaultsOnly)
TAssetPtr<UTexture2D> LargeBackgroundTexture;

// Load asynchronously when needed
TSoftObjectPtr<UTexture2D> AsyncTexture;
```
