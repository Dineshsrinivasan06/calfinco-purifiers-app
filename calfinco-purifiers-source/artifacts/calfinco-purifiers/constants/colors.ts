/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#15353A',
    tint: '#087E83',

    // Core surfaces
    background: '#F3F8F7',
    foreground: '#15353A',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#15353A',

    // Primary action color (buttons, links, active states)
    primary: '#087E83',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E4F2EF',
    secondaryForeground: '#15353A',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EAF1EF',
    mutedForeground: '#688083',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#BFE9DF',
    accentForeground: '#145D5D',

    // Destructive actions (delete, error states)
    destructive: '#C84B4B',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#DCE7E4',
    input: '#DCE7E4',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
