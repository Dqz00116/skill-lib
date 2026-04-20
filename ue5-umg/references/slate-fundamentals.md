# Slate Fundamentals

Quick reference for direct Slate usage. Most game UI should use UMG (built on Slate),
but Slate is necessary for editor tools, debug UI, and custom drawing.

## When to Use Slate Directly

| Use Case | Recommendation |
|----------|---------------|
| In-game HUD/menus | UMG (retained mode, better performance) |
| Editor tools/plugins | Slate (immediate mode, full control) |
| Debug overlays | Slate or `DrawDebug` |
| Custom rendering | Slate `SWidget` subclass with custom paint |

## Basic Slate Syntax

```cpp
// Simple button in Slate
SNew(SButton)
    .Text(FText::FromString("Click Me"))
    .OnClicked_Lambda([]() {
        UE_LOG(LogTemp, Log, TEXT("Clicked!"));
        return FReply::Handled();
    })
```

```cpp
// Nested layout
SNew(SVerticalBox)
+ SVerticalBox::Slot()
    .AutoHeight()
    [
        SNew(STextBlock)
        .Text(FText::FromString("Header"))
    ]
+ SVerticalBox::Slot()
    .FillHeight(1.0f)
    [
        SNew(SScrollBox)
        + SScrollBox::Slot()
        [
            SNew(STextBlock)
            .Text(FText::FromString("Content"))
        ]
    ];
```

## Slate ↔ UMG Bridge

To embed Slate in UMG or vice versa:

```cpp
// Create native Slate widget inside UMG
TSharedRef<SWidget> MySlateWidget = SNew(SMyCustomWidget);
UWidget* Widget = SNew(SObjectWidget).WidgetArgs(
    SNew(SBox)
    [
        MySlateWidget
    ]
);
```

## Key Slate Concepts

| Concept | Explanation |
|---------|-------------|
| `SNew()` | Creates shared-ref widget (always use for Slate) |
| `SAssignNew()` | Creates and assigns to variable |
| Slots | Layout containers own child slots (not children directly) |
| `FReply` | Return from input handlers — `Handled()`, `Unhandled()` |
| `FGeometry` | Widget's position, size, and clipping info |
| `FSlateApplication` | Global app state, input routing |

## Performance Note

Slate rebuilds its widget tree every frame (immediate mode). For game UI with
hundreds of widgets, UMG's retained mode is significantly more efficient.
Only use Slate directly when you need the flexibility.
