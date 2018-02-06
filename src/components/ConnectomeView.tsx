import * as React from 'react'
import { ResponsiveChord } from '@nivo/chord'
import * as Papa from 'papaparse';
import {stylesheet} from 'react-stylesheet-decorator'

export default class ConnectomeView extends React.Component {

  state = {
    connectomeData: [], //Matrix with the data
    headerData: [], // Header Data [Label, Region]
    showChord: true
  }

  private toggleDiagrams() {
    this.setState({ showChord: !this.state.showChord });
  }

  private parseData(){
    this.parseLabelInfo();
    this.parseDataFromCSV();
  }

  //Sorts the data anatomically based on the keys (Right, SubRight, BrainStem, SubLeft, Left(Order of priority))
  private sortData(){ 
    
    /*
    var sortedArr = this.state.connectomeData[0].map((col, i) => this.state.connectomeData.map(row => row[i]));
    //Sort function
    sortedArr.sort(sortRegions);
    function sortRegions(a, b) {
      var orientA = (a[0].slice(-1) === 'R') ? 1 : (a[0].slice(-1) === 'L') ? 3 : 2;
      var orientB = (b[0].slice(-1) === 'R') ? 1 : (b[0].slice(-1) === 'L') ? 3 : 2;
      if (orientA === orientB) {
        return 0;
      }
      else {
        return (orientA < orientB) ? -1 : 1;
      }
    }
    sortedArr = sortedArr[0].map((col, i) => sortedArr.map(row => row[i]));
    this.setState({ connectomeData: sortedArr});
    */
  }

  private parseDataFromCSV(){
    Papa.parse("https://raw.githubusercontent.com/aalises/ami-viewerData/master/connectome.csv", {
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (resultData) => {
        this.setState({ connectomeData: resultData.data});
        this.sortData();
      }
    });
  }

  private parseLabelInfo(){
    Papa.parse("https://raw.githubusercontent.com/aalises/ami-viewerData/master/volumetric.csv", {
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (resultHeader) => {
        this.setState({ headerData: resultHeader.data});
      }
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
      height: 90%;
      width: 90%;
      z-index: 100;
      padding: 10px;
      font-family: "Trebuchet MS", Helvetica, sans-serif;
      font-size: 12px !important;
    }

    .connectomeview svg text {
      font-family: Trebuchet MS", Helvetica, sans-serif;
      font-size: 12px !important;
    }
  
    connectomeview > div {
      overflow: hidden;
      display: flex;
    }
  `)

    public render(){
      return (
        <div className="connectomeview">
        {this.state.headerData && this.state.connectomeData &&
            //Render the chord Diagram
            <ResponsiveChord className="connectomeview"
            matrix={this.state.connectomeData}
            keys={this.state.headerData[0]}
            margin={{
                "top": 0,
                "right": 300,
                "bottom": 40,
                "left": 300
            }}
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
            colors="d320c"
            isInteractive={true}
            arcHoverOpacity={1}
            arcHoverOthersOpacity={0.4}
            ribbonHoverOpacity={0.9}
            ribbonHoverOthersOpacity={0.1}
            animate={false}
        />
        }
        </div>
      );
    }
  
  }

