# Preact Connectome Viewer

A Preact + Typescript component which wraps a Brain Connectome (Chord diagram) Viewer using Nivo.
The data from the brain connectomics are `csv` obtained from the analysis results of the [QMENTA](https://www.qmenta.com/) pipelines, so the parsing and treatment of the data is tailored to the format of such matrices.

### Parameters

- **thres (optional)**: Threshold to filter the connection strength. Connections below the threshold are filtered out. The default threshold is 0.12

- **groupsList**: Array containing the different group names of our data e.g `["Right","BrainStem","Left"]`. It is used to determine the order of the different groups in our data, the ones appearing first on the array are placed before on the circle, rotating clockwise.

- **ColorPalette**: Array containing the colors for each group name, in hex e.g `["#357066","#d1c34f", "#9c9ede"]`.


## Build

```
npm run build
```

## Run development server

To run the webpack development server:

```
npm run dev
```
