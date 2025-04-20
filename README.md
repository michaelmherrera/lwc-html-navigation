# lwc-html-navigation 

This VS Code extension implements 'Go To Definition' for Lightning Web Components (LWC) within HTML templates. With this extension, you can click on a referenced component in your HTML and use the 'Go To Definition' option to navigate directly to the HTML file of the selected component.

## Features

- **Navigate to Component Definitions**: Quickly jump to the HTML file of any referenced LWC component in your project.
- **Error-Free Navigation**: Avoid accidentally navigating to test mocks or similarly named components.
- **Improved Productivity**: Eliminate the need to manually search for component files by name, saving time and reducing errors.
- **Modern Coding Experience**: Provides a feature that is standard in modern development environments, now tailored for LWC projects.

### Example

Given the following HTML, you can right-click on `<c-contact-tile>` and select 'Go To Definition' to navigate directly to the `c-contact-tile` component's HTML file.


```html
<c-contact-tile
    class="slds-show slds-is-relative"
    key={contact.Id}
    contact={contact}
></c-contact-tile>
```

## Requirements

- By default, this extension assumes components are located in `force-app/main/default/lwc`. You can customize this in your workspace settings.

## Extension Settings

This extension contributes the following settings:

- `lwcHtmlNavigation.namespaces`: An array of namespace configurations. Each configuration includes:
  - `path`: The relative path to the namespace directory (e.g., `force-app/main/default/lwc`).
  - `namespace`: The namespace prefix used in your components (e.g., `my_app`).

Example configuration:

```json
{
  "lwcHtmlNavigation.namespaces": [
    {
      "path": "force-app/main/default/lwc",
      "namespace": "my_app"
    }
  ]
}
```

## Known Issues

- Components with non-standard directory structures may not be resolved correctly.
- Only supports navigation for components referenced in HTML files.

## Release Notes

### 0.0.1

- Initial release of `lwc-html-navigation`.
- Added support for navigating to LWC component definitions.

---

## Following Extension Guidelines

This extension follows the [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) to ensure a high-quality user experience.

**Enjoy!**
