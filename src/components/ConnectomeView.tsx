import * as React from "react";
import { ResponsiveChord } from "@nivo/chord";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import * as Papa from "papaparse";
import { stylesheet } from "react-stylesheet-decorator";

interface connectomeViewProps {
  thres: number;
  groupsList: string[];
  colorPalette: string[];
}

export default class ConnectomeView extends React.Component<connectomeViewProps,any> {
  state = {
    connectomeData: [], //Matrix with all the data
    currentData: [], //Current filtered matrix
    connectomeDataMat: [],
    //Header Data [Labels, Regions]
    labels: [],
    groups: [],
    showChord: true
  };

  colors = [] //Colors assigned to the labels

  //Util functions for getting a column of an array and transposing an array
  arrayColumn = (arr, n) => arr.map(x => x[n]);
  transpose = data => data[0].map((col, i) => data.map(row => row[i]));
  generateColors = (groups) => groups.map((val,i) => this.props.colorPalette[this.props.groupsList.indexOf(val)]); //Create colors based on group from our color palette

  private toggleDiagrams() {
    this.setState({ showChord: !this.state.showChord });
  }

  private parseData() {
    Promise.all([this.parseLabelInfo(), this.parseDataFromCSV()]).then(_ => {

      this.sortData(); //Sort the data, generate colors and filter once everything is loaded
      this.colors = this.generateColors(this.state.groups);
      var filtData = this.filterDataThres(this.state.connectomeData.slice(),this.props.thres);
      this.setState({ currentData: filtData });

      //Parse the matrix data
      this.setState({connectomeDataMat: this.convertToMatrixData(this.state.currentData)});
    });
  }

  private groupsorting = (a, b) => {
    //Note: Reorders rows of the matrix
    var orientA = this.props.groupsList.indexOf(a[0]);
    var orientB = this.props.groupsList.indexOf(b[0]);

    return orientA == orientB ? 0 : orientA < orientB ? -1 : 1;
  };

  private filterDataThres(data, thres) {
    var filteredData = data.map(row => row.map(el => (el < thres ? 0 : el)));
    return filteredData;
  }

  /* Sorts the data anatomically based on the groups */
  private sortData() {
    var groups = this.state.groups.slice();
    var labels = this.state.labels.slice();
    var data = this.state.connectomeData.slice();
    data.unshift(groups, labels);

    /* Sort the columns of the matrix and set the labels and regions */
    data = this.transpose(data);
    data.sort(this.groupsorting);
    this.setState({ groups: this.arrayColumn(data, 0) });
    this.setState({ labels: this.arrayColumn(data, 1) });
    data = this.transpose(data);

    /* Sort the rows of the matrix the same way to keep the matrix symmetric */
    //First re-add the original labels and regions on the transposed matrix to do the row sorting

    data = this.transpose(data.splice(2, data.length));
    data.unshift(groups, labels);

    data = this.transpose(data); //At this point we have the original matrix with the two first columns our header
    data.sort(this.groupsorting);
    data = this.transpose(data);

    //Erase the labels and groups from the data
    data = this.transpose(data.splice(2, data.length));

    this.setState({ connectomeData: data });
  }

  private parseDataFromCSV() {
    return new Promise((resolve, reject) => {
      Papa.parse(
        "https://raw.githubusercontent.com/aalises/ami-viewerData/master/connectome.csv",
        {
          download: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: resultData => {
            this.setState({ connectomeData: resultData.data });
            resolve();
          }
        }
      );
    });
  }

  private parseLabelInfo() {
    return new Promise((resolve, reject) => {
      Papa.parse(
        "https://raw.githubusercontent.com/aalises/ami-viewerData/master/volumetric.csv",
        {
          download: true,
          dynamicTyping: true,
          skipEmptyLines: true,

          complete: resultHeader => {
            var numResidualRows = 9; //On the volumetric CSV, the unused labels are the first 9 rows
            var filteredArray = resultHeader.data.splice(
              numResidualRows,
              resultHeader.data.length - numResidualRows
            );
            this.setState({ labels: this.arrayColumn(filteredArray, 8) });
            this.setState({ groups: this.arrayColumn(filteredArray, 9) });
            resolve();
          }
        }
      );
    });
  }

  private convertToMatrixData(inputData){
    //Parses the data so the Matrix can interpret it
    return inputData.map((arr, index) => {

      const row = {
        "labelName": this.state.labels[index]
      };

      this.state.labels.forEach((key, indexLabel) =>{ row[key] = (arr[indexLabel] === 0) ? arr[indexLabel] : Number(arr[indexLabel].toFixed(2)) });
      return row;
     });

     
  }

  componentDidMount() {
    this.parseData();
  }

  @stylesheet(`
    .connectomeview {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: 100;
      padding: 10px;
      font-family: "Trebuchet MS", Helvetica, sans-serif;
      font-size: 10px !important;
    }

    .connectomeview svg text {
      font-family: Trebuchet MS", Helvetica, sans-serif;
      font-size: 10px !important;
    }

    connectomeview > div {
      overflow: hidden;
      display: flex;
    }
  `)
  public render() {
    const dataReady = this.state.labels.length && this.state.currentData.length && this.state.connectomeDataMat.length;

    return (
      <div className="connectomeview">
        {!dataReady && <div> Data is loading </div>}
          {dataReady && this.state.showChord ? <ResponsiveChord
            matrix={this.state.currentData}
            keys={this.state.labels}
            margin={{top: 200,right: 200,bottom: 200,left: 200}}
            pixelRatio={1}
            padAngle={0.03}
            innerRadiusRatio={0.86}
            innerRadiusOffset={0}
            arcOpacity={1}
            arcBorderWidth={1}
            arcBorderColor="inherit:darker(0.2)"
            ribbonOpacity={0.5}
            ribbonBorderWidth={1}
            ribbonBorderColor="inherit:darker(0.4)"
            enableLabel={true}
            label="id"
            labelOffset={15}
            labelRotation={-90}
            labelTextColor="inherit:darker(1.7)"
            colors={this.colors}
            isInteractive={true}
            arcHoverOpacity={1}
            arcHoverOthersOpacity={0.4}
            ribbonHoverOpacity={0.9}
            ribbonHoverOthersOpacity={0.1}
            animate={false}
          /> :   <ResponsiveHeatMap
          data={this.state.connectomeDataMat}
          keys={this.state.labels}
          indexBy="labelName"
          margin={{"top": 120,"right": 80,"bottom": 30,"left": 160}}
          forceSquare={false}
          axisTop={{"orient": "top","tickSize": 5,"tickPadding": 5,"tickRotation": -55,"legend": "","legendOffset": 36}}
          axisLeft={{"orient": "left","tickSize": 5,"tickPadding": 5,"tickRotation": 0,"legend": "","legendPosition": "center","legendOffset": -40}}
          cellShape="rect"
          colors="nivo"
          cellBorderColor="inherit:darker(1.2)"
          labelTextColor="inherit:darker(0.8)"
          defs={[{"id": "lines","type": "patternLines","background": "inherit","color": "rgba(0, 0, 0, 0.1)","rotation": -45,"lineWidth": 4,"spacing": 7}]}
          fill={[{"id": "lines"}]}
          animate={false}
          hoverTarget="rowColumn"
          cellHoverOthersOpacity={0.3}
      />         
          }       
      </div>
    );
  }
}
