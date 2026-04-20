# Blueprint Visual Design Guide

Designing widget layouts, animations, and visual states in UMG Widget Blueprints.

Use this when the C++ base class already exists and you need to create or polish the visual layer.

---

## Layout Containers

Choose the right container for your layout. Each gives its children different Slot properties.

| Container | Best For | Slot Properties |
|-----------|----------|-----------------|
| **Canvas Panel** | Pixel-precise positioning, HUD elements, overlapping layers | Anchors, Position (X/Y), Size, ZOrder, Alignment |
| **Overlay** | Stacking widgets (background + content + foreground) | Padding, Horizontal/Vertical Alignment |
| **Horizontal Box** | Row of items (action bar, stats row) | Padding, Alignment, Fill Size |
| **Vertical Box** | Column of items (list, form, menu) | Padding, Alignment, Fill Size |
| **Uniform Grid** | Same-size grid (inventory slots, hotbar) | Row/Column, Padding, Alignment |
| **Widget Switcher** | Mutually exclusive pages (tabs, menu screens) | N/A (only one child visible) |
| **Scroll Box** | Scrollable content exceeding viewport | Padding, Horizontal Alignment |
| **Size Box** | Constraining child size, aspect ratio | Width/Height Override, Min/Max |
| **Border** | Decorated panel with brush and padding | Padding, Horizontal/Vertical Alignment |
| **Safe Zone** | Respecting TV safe areas on consoles | Padding (platform-aware) |

### Slot Rule

Slot properties control how a widget behaves **inside its parent**. They are the first properties shown in the Details panel when a child is selected. Changing the parent container changes the available Slot options.

### Canvas Panel Anchors

Anchors determine what a widget's position and size are relative to.

| Anchor Preset | Behavior | Example Use |
|---------------|----------|-------------|
| **Full Screen** | Stretches to fill parent | Background images, fullscreen overlays |
| **Top-Left** | Fixed offset from top-left | Health bars, corner minimaps |
| **Top-Center** | Centered on top edge | Title text, notifications |
| **Top-Right** | Fixed offset from top-right | Settings button, clock |
| **Center** | Centered with offset | Popups, dialogs, crosshairs |
| **Bottom-Left** | Fixed offset from bottom-left | Chat box, quest log |
| **Bottom-Center** | Centered on bottom edge | Action bar, subtitles |
| **Bottom-Right** | Fixed offset from bottom-right | Minimap, score |
| **Custom** | Min/Max define stretch region | Content panels that fill space |

**Best practice:** Set the anchor first, then adjust position and size. If you set position before the anchor, the widget will jump when you change the anchor.

### Alignment vs Position

- **Alignment**: Determines which point of the widget sits at the position coordinate. (0,0) = top-left of widget, (1,1) = bottom-right, (0.5,0.5) = center.
- **Position**: The coordinate where the alignment point is placed.

Example: A minimap anchored to Bottom-Right with Alignment (1,1) and Position (0,0) sits exactly in the bottom-right corner.

---

## Responsive Design

### Design at Minimum Resolution

Always design at your game's minimum supported resolution:

1. In Widget Designer, click the viewport resolution dropdown (top-right)
2. Choose **Custom**
3. Enter your minimum resolution (e.g., 1280 x 720)
4. Verify all text is legible, no overlaps, no clipped text

**Why:** Scaling up from a small design works cleanly. Scaling down from a large design produces unreadable text and broken layouts.

### DPI Scaling

The UI automatically scales based on screen resolution via Project Settings:

**Project Settings > User Interface > DPI Scaling**

| Setting | Effect |
|---------|--------|
| **Shortest Side** | Scales based on smaller screen dimension (default, good for portrait/landscape) |
| **Longest Side** | Scales based on larger dimension |
| **Horizontal** | Scales based on width only |
| **Vertical** | Scales based on height only |

**Custom DPI Curve:** Create a curve to control exact scaling steps. For example, step from 1.0 to 1.5 to 2.0 at specific resolution thresholds to keep UI crisp.

### Safe Zones

For console certification, wrap critical UI in a **Safe Zone** widget:

- Set **Pad Left/Right/Top/Bottom** in the Safe Zone's properties
- On PC these are typically 0; on consoles they auto-populate from platform SDK
- Never place critical text or HUD elements at the extreme edges

---

## 9-Slice and Brushes

### Image Draw Modes

The Image widget has three draw modes for different use cases:

| Mode | How It Works | Use Case |
|------|-------------|----------|
| **Image** | Simple texture display | Icons, portraits, static images |
| **Box** | 9-slice scaling | Buttons, panels, backgrounds that stretch |
| **Border** | 9-slice but only edges | Frames, outlines, decorative borders |

### 9-Slice Setup

For Box and Border modes, set the margin in the brush:

1. Select the Image widget
2. In Details > Appearance > Brush, expand the texture asset
3. Set **Margin** (Left, Top, Right, Bottom in pixels)
4. The margin defines the corner regions that do NOT stretch

**Example:** A button texture with 10px margins keeps the rounded corners crisp while the center and edges stretch to any size.

### Texture Best Practices

- Author UI textures at your **highest** supported resolution (e.g., 4K)
- Create a **custom texture group** with mipmaps enabled so textures look good when scaled down
- Use texture atlases for multiple small UI elements to reduce draw calls

---

## Text Styling

### Text Block Properties

| Property | Purpose |
|----------|---------|
| **Font** | Font family asset, size, typeface (regular/bold/italic) |
| **Color and Opacity** | Text color |
| **Shadow Offset/Color** | Drop shadow for readability |
| **Justification** | Left, Center, Right (affects multi-line wrapping) |
| **Auto Wrap Text** | Enable for dynamic content |
| **Wrap Text At** | Fixed pixel width for wrapping |
| **Line Height Percentage** | Adjust vertical spacing between lines |
| **Transform Policy** | Uppercase, Lowercase, or As Typed |

### Rich Text Block

For mixed-style text (colored segments, inline icons, bold segments):

1. Use a **Rich Text Block** widget instead of Text Block
2. Create a **Data Table** asset with text styles
3. Assign the Data Table to the Rich Text Block's **Text Style Set**
4. In text content, use XML-style tags: `<Title>Header</> <Default>Normal text</>`

**Example:**
```
<Damage>+25</> <Default>damage dealt to</> <Enemy>Goblin</>
```

---

## Animation Design

### Creating Animations

1. Open the Widget Blueprint
2. Click the **Animations** tab at the bottom
3. Click **+ Animation**, name it (e.g., "Show", "Hide", "Hover")
4. Select a widget in the Hierarchy panel
5. Click **+ Track** → choose property (e.g., Render Transform, Color, Visibility)
6. Scrub the timeline (drag the playhead)
7. Click the **+** button to add a keyframe at that time
8. Adjust the property value in the Details panel

### Animation Properties You Can Animate

| Property | Effect |
|----------|--------|
| **Render Transform** | Position, Scale, Rotation, Shear |
| **Render Opacity** | Fade in/out (0 to 1) |
| **Color and Opacity** | Tint color change |
| **Visibility** | Show/hide (useful for staging) |
| **Material Parameters** | Any scalar/vector/texture parameter on a material |

### Animation Types

After creating a track, right-click a section to change its type:

| Type | Behavior |
|------|----------|
| **Absolute** | Sets exact value (default) |
| **Additive** | Adds to current value |
| **Relative** | Relative to value at animation start |
| **Additive from Base** | Additive but with a defined base value |

### Easing Curves

Right-click a keyframe to set easing:

| Curve | Feel |
|-------|------|
| **Linear** | Constant speed (mechanical) |
| **Ease In** | Slow start, fast end (entering) |
| **Ease Out** | Fast start, slow end (exiting) |
| **Ease In Out** | Slow start/end, fast middle (natural motion) |

**Best practice:** UI motion should almost always use **Ease In Out** for natural, physical feel.

### Animation Events

Trigger Blueprint logic at specific animation times:

1. Scrub to desired time
2. Click the small **+** next to the **Events** flag on the track
3. Right-click the new keyframe → **Properties > Event > Create New Endpoint**
4. The graph opens with a new event node

Use events to: spawn particles, play sounds, enable input, or remove widget after hide animation.

### Reusing Animations

Widget animations cannot be saved as separate assets. Workarounds:

- **Named Slot Container:** Create a reusable widget with a Named Slot and animations on the Named Slot. Place content inside.
- **C++ UPROPERTY(Interp):** Mark C++ properties with `UPROPERTY(Interp)`, then animate them from Blueprint via `[[This]]` track.
- **Retarget:** Right-click a track → "Replace with (widget name)" to apply the same animation to a different widget.

---

## State Management

### Widget Switcher

Use for mutually exclusive content (tabs, menu pages, settings categories):

1. Add a **Widget Switcher** to the layout
2. Drag child widgets into it as "pages"
3. In Graph: call `Set Active Widget Index` or `Set Active Widget`

**Important:** All children are constructed at initialization, even hidden ones. If a page is heavy (complex inventory, many widgets), consider lazy instantiation in C++ instead.

### Visibility States

| State | Visible | Interactive | Hit Test | Layout Space |
|-------|---------|-------------|----------|-------------|
| **Visible** | Yes | Yes | Yes | Yes |
| **Collapsed** | No | No | No | No |
| **Hidden** | No | No | No | Yes |
| **Self Hit Test Invisible** | Yes | Yes | No | Yes |
| **Hit Test Invisible** | Yes | No | No | Yes |

**Rule:** Use **Collapsed** for hiding (saves layout and rendering cost). Use **Hidden** only when you need to preserve the widget's layout space.

### Focus and Navigation

For gamepad/keyboard support:

1. Select interactive widgets (buttons, sliders, editable text)
2. In Details > Behavior, check **Is Focusable**
3. In Details > Navigation, configure directional rules:
   - **Escape**: Where focus goes when pressing "back"
   - **Next/Previous**: Tab order
   - **Up/Down/Left/Right**: Directional navigation
   - **Explicit**: Manually set the widget for each direction
   - **Wrap**: Wrap around to opposite side
   - **Stop**: Prevent navigation in that direction

**Initial Focus:** When showing a menu, explicitly set focus to the first button:
- In C++: `Widget->SetUserFocus(GetOwningPlayer())`
- In Blueprint: `Set User Focus` node

---

## Materials in UI

### Applying Materials to Images

1. Create a Material, set **Material Domain** to **User Interface**
2. Set **Blend Mode** to **Transparent** (for opacity)
3. Use the **VertexColor** node to access the Image widget's Color property
4. In the Widget Blueprint, select the Image
5. In Details > Appearance > Brush, set **Image Size** and assign the Material

### Dynamic Material Instances

To change material parameters at runtime:

1. In Blueprint, create a **Dynamic Material Instance** from the base material
2. Set the Dynamic Instance on the Image widget
3. Call **Set Scalar Parameter Value**, **Set Vector Parameter Value**, etc.

### RetainerBox

Apply a material to ALL children of a container:

1. Add a **RetainerBox** to your layout
2. Wrap the widgets you want to affect inside it
3. Set the **Effect Material** to a User Interface material
4. The material receives the children's rendered output as a texture

**Use cases:** Desaturation effects, glitch overlays, post-processing on UI sections.

---

## Performance in Blueprints

| Technique | How | When to Use |
|-----------|-----|-------------|
| **InvalidationBox** | Wrap static content. Call Invalidate when content changes. | Complex widget hierarchies that rarely update |
| **RetainerBox** | Wrap content with an effect material | Post-processing effects on UI sections |
| **ListView** | Use instead of VerticalBox for 10+ items | Scrollable lists, inventories, leaderboards |
| **Collapse hidden widgets** | Set Visibility to Collapsed | Widgets that toggle on/off |
| **Avoid Bind properties** | Don't click "Bind" next to widget properties | All widget properties — use events or manual updates |
| **Lazy load heavy pages** | Create WidgetSwitcher pages on demand | Complex pages (inventory, skill trees) |
| **Use texture atlases** | Combine small textures into one | Many small icons, buttons |

### Blueprint "Bind" — Never Use

The "Bind" button next to widget properties creates a function that runs **every frame**.

**Problems:**
- Wastes CPU even when value hasn't changed
- Find References doesn't show bound functions
- Easy to accidentally add expensive logic
- Nearly impossible to debug in large widgets

**Alternative:** Update properties explicitly when data changes (in C++ delegates, Blueprint events, or animation events).

---

## Naming in Blueprints

Consistent naming within Blueprints makes C++ binding and team collaboration easier:

| Widget Type | Suffix | Example |
|-------------|--------|---------|
| TextBlock | Label | HealthLabel, ScoreLabel |
| Image | Image | IconImage, BackgroundImage |
| Button | Button | ConfirmButton, CancelButton |
| Panel (any container) | Panel | ContentPanel, RootPanel |
| WidgetSwitcher | Switcher | PageSwitcher, TabSwitcher |
| ProgressBar | Bar | HealthBar, ExpBar |
| Slider | Slider | VolumeSlider, BrightnessSlider |

**Rule:** Only give custom names to widgets that have C++ BindWidget bindings or are referenced in Blueprint graphs. Leave default names on decorative/static widgets.

---

## Resolution Checklist

Before shipping, verify your UI at multiple resolutions:

- [ ] Design tested at minimum resolution (e.g., 1280x720)
- [ ] All text legible at minimum resolution
- [ ] No overlapping elements
- [ ] No text breaking out of containers
- [ ] Tested with +30% longer text for localization
- [ ] Tested at 4K or highest target resolution
- [ ] DPI scaling curve configured (if using custom scaling)
- [ ] Safe zone padding applied for console targets
