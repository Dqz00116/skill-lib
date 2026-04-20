---
name: ue5-umg
description: Use when building HUDs, menus, inventory screens, settings panels, or any widget-based interface in Unreal Engine 5. Also use when connecting C++ logic to UMG Blueprint visuals, handling gamepad or keyboard focus navigation, managing UI state, creating widget animations, or troubleshooting UMG performance issues like frame drops, hitches, or widget memory leaks.
version: 1.3.0
---

# UE5 UMG Studio

Orchestrate C++ logic and Blueprint visuals for production UE5 user interfaces.
Work in two layers: C++ for architecture and data binding, Blueprints for layout and polish.

## Overview

Build production-ready Unreal Engine 5 user interfaces using a hybrid C++/Blueprint approach.
C++ handles widget architecture, data binding, lifecycle, and performance; Blueprints handle
layout, styling, animation, and visual state management.

## When to Use

- Creating HUDs, menus, inventories, settings panels, or any widget-based interface
- Binding C++ properties to Blueprint widget components via `BindWidget`
- Handling gamepad or keyboard focus navigation and input modes
- Designing responsive UMG layouts, animations, and visual states
- Optimizing UI performance (widget pooling, ListView, Tick abuse, material overhead)
- Troubleshooting memory leaks from widget pools or dangling delegate references

## When NOT to Use

- Editor tools, debug overlays, or custom Slate drawing — see `references/slate-fundamentals.md`
- Deep Common UI Plugin specifics — refer to official Epic documentation
- General gameplay programming unrelated to UI

## Core Pattern: Hybrid C++/Blueprint Workflow

**Without separation:** Blueprint-only logic becomes spaghetti, C++-only UI is slow to iterate.
**With separation:** C++ owns data, state, and lifecycle; Blueprints own layout, style, and animation.

```cpp
// C++ Logic Layer: data binding and state
UCLASS(Abstract)
class UMyWidget : public UUserWidget
{
    GENERATED_BODY()

protected:
    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UProgressBar> HealthBar;

    virtual void NativeConstruct() override;
    virtual void NativeDestruct() override;
};
```

```cpp
void UMyWidget::NativeConstruct()
{
    Super::NativeConstruct();
    if (HealthBar)
    {
        HealthBar->SetPercent(1.0f);
    }
}
```

The Blueprint subclass of `UMyWidget` places a ProgressBar named **HealthBar**
in the Designer and styles it without any logic nodes.

## Quick Reference

| Task | Reference File |
|------|---------------|
| C++ base class, BindWidget, pooling, ListView, input modes | `references/umg-cpp-patterns.md` |
| Layout containers, anchors, animation, styling, materials | `references/blueprint-visuals.md` |
| Common mistakes and how to fix them | `references/common-pitfalls.md` |
| Slate direct usage for editor tools | `references/slate-fundamentals.md` |

## Key Rules

**C++ Logic:**
- Always use `UCLASS(Abstract)` on base classes meant for Blueprint subclassing
- BindWidget names must match Blueprint component names exactly (case-sensitive)
- Bind delegates in `NativeConstruct`, unbind in `NativeDestruct`
- Override `ReleaseSlateResources` when using `FUserWidgetPool`

**Blueprint Visuals:**
- Design at your minimum supported resolution (e.g. 1280x720)
- Use `Collapsed` visibility for hiding; `Hidden` only to preserve layout space
- Use `WidgetSwitcher` for mutually exclusive pages, not Visibility toggling
- Never use Blueprint "Bind" properties — they run every frame

**Performance:**
- Use `UListView` / `UTileView` for scrollable lists with 10+ items
- Avoid `NativeTick` for polling; use delegates and events
- Call `SetVisibility` only when state actually changes

## Quality Gates

- [ ] `UCLASS(Abstract)` on base classes; BindWidget names match exactly
- [ ] Delegates bound in `NativeConstruct`, unbound in `NativeDestruct`
- [ ] Input mode and focus set when showing or hiding UI
- [ ] `ReleaseSlateResources` implemented if using widget pools
- [ ] ListView used for scrollable lists with 10+ items
- [ ] No Blueprint "Bind" properties used for dynamic values
- [ ] UI designed at minimum target resolution; anchors used for responsiveness
