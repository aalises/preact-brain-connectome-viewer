import * as React from 'react'
import { ResponsiveChord } from '@nivo/chord'
import * as Papa from 'papaparse';
import {stylesheet} from 'react-stylesheet-decorator'

export default class ConnectomeView extends React.Component {

  state = {
    connectomeData: [], //Matrix with the data
    labels: [], // Header Data [Label, Region]
    groups: [],
    showChord: true
  }

  //Groups of our connectome ordered by preference (clockwise starting from the top) on the chord diagram. Data pertaining to a group not here will be placed first
  groups = ["Right","Subcortical-Right","Brainstem","Subcortical-Left","Left"];

  //Util functions for getting a column of an array and transposing an array
  arrayColumn = (arr, n) => arr.map(x => x[n]);
  transpose = (data) => data[0].map((col, i) => data.map(row => row[i]));

  private toggleDiagrams() {
    this.setState({ showChord: !this.state.showChord });
  }

  private parseData(){
    this.parseLabelInfo();
    this.parseDataFromCSV();
  }

  private groupsorting = (a, b) => { //Note: Reorders rows of the matrix
    var orientA = this.groups.indexOf(a[0]);
    var orientB = this.groups.indexOf(b[0]);

    return (orientA == orientB) ? 0 : (orientA < orientB) ? -1 : 1; 
  }

  /* 
    Sorts the data anatomically based on the groups
  */
  private sortData(){ 

    var groups = this.state.groups.slice();
    var labels = this.state.labels.slice();
    var data = this.state.connectomeData.slice();
    data.unshift(groups,labels);

    /* Sort the columns of the matrix and set the labels and regions */
    data = this.transpose(data);
    data.sort(this.groupsorting);
    this.setState({groups : this.arrayColumn(data,0)});
    this.setState({labels : this.arrayColumn(data,1)});
    data = this.transpose(data);

    /* Sort the rows of the matrix the same way to keep the matrix symmetric */
    //First re-add the original labels and regions on the transposed matrix to do the row sorting
    
    data = this.transpose(data.splice(2,data.length));
    data.unshift(groups,labels);

    data = this.transpose(data); //At this point we have the original matrix with the two first columns our header
    data.sort(this.groupsorting);
    data = this.transpose(data);

    //Erase the labels and groups from the data
    data = this.transpose(data.splice(2,data.length));

    this.setState({connectomeData: data});

  }

  private parseDataFromCSV(){
    Papa.parse("https://raw.githubusercontent.com/aalises/ami-viewerData/master/connectome.csv", {
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (resultData) => {
        this.setState({ connectomeData: resultData.data});
        this.sortData(); //Move to promise!
      }
    });
  }

  private parseLabelInfo(){
    Papa.parse("https://raw.githubusercontent.com/aalises/ami-viewerData/master/volumetric.csv", {
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,

      complete: (resultHeader) => {
        var numResidualRows = 9; //On the volumetric CSV, the unused labels are the first 9 rows
        var filteredArray = resultHeader.data.splice(numResidualRows,resultHeader.data.length - numResidualRows);
        this.setState({ labels: this.arrayColumn(filteredArray,8)});
        this.setState({ groups: this.arrayColumn(filteredArray,9)});
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
        {this.state.labels.length && this.state.connectomeData.length &&
            //Render the chord Diagram
            <ResponsiveChord
            matrix={this.state.connectomeData}
            keys={this.state.labels}
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

