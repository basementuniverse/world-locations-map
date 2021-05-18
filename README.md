# World Locations Map

Show a list of locations on a world map.

![preview](preview.png "Preview")

## Installation

```bash
npm install @basementuniverse/world-locations-map
```
```bash
yarn add @basementuniverse/world-locations-map
```

## How to use

```typescript
import { WorldLocationsMap } from '@basementuniverse/world-locations-map';
```

```jsx
<WorldLocationsMap
  background="#333"
  foreground="#777"
  locations={[
    {
      lat: 51.4,
      long: -1,
      label: 'UK',
      colour: '#0f0',
      size: 0.05
    },
  ]}
/>
```

### Props

```typescript
{
  background?: string,
  foreground?: string,
  locations: {
    long: number,
    lat: number,
    label?: string,
    size?: number,
    colour?: string,
  }[],
}
```
