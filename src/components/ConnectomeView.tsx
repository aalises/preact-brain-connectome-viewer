import * as React from 'react'
import { ResponsiveChord } from '@nivo/chord'
import * as Papa from 'papaparse';
import {stylesheet} from 'react-stylesheet-decorator'

export default class ConnectomeView extends React.Component {

  state = {
    dataChord: [],
    showChord: true
  }

  private toggleDiagrams() {
    this.setState({ showChord: !this.state.showChord });
  }

  private parseData(){
    this.parseChordFromCSV();
  }

  private sortData(){ //Sorts the data anatomically based on the keys (from Right to Left)
    var sortedArr = this.state.dataChord[0].map((col, i) => this.state.dataChord.map(row => row[i]));
    //Sort function
    sortedArr.sort(sortRegions);

    function sortRegions(a, b) {
      //We codify the right regions to be a lower number so they are sorted first: Right: 1 , SubRight: 2, BrainStem: 3, SubLeft: 4, Left: 5
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
    this.setState({ dataChord: sortedArr});
  }

  private parseChordFromCSV(){
    Papa.parse("https://raw.githubusercontent.com/aalises/ami-viewerData/master/connectome_final_norm.csv", {
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        this.setState({ dataChord: results.data});
        this.sortData();
      }
    });
  }

    private parseMatrixFromCSV(){
      Papa.parse("https://raw.githubusercontent.com/aalises/ami-viewerData/master/connectome_final_norm.csv", {
        download: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        header:true,
        complete: (results) => {
          this.setState({ dataMatrix: results.data });
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
      const [keys, ...rows] = this.state.dataChord;
      return (
        <div className="connectomeview">
        {keys && rows &&
            //Render the chord Diagram
            <ResponsiveChord className="connectomeview"
            matrix={rows}
            keys={keys}
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

