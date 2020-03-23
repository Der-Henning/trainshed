import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import Axios from "axios";
import styles from "../styles/styles.module.css";
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  VerticalBarSeriesCanvas
} from "react-vis";

const color = {
  open: "#00FFFF",
  cancelled: "#FF0000",
  locked: "#00FF00",
  finished: "#008000"
};

class ChartTrainings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: null,
      useCanvas: false,
      statusList: []
    };
  }

  componentDidMount() {
    this.fetchStatusList();
    this.fetchChartData();
  }

  fetchStatusList = () => {
    const { api, token } = this.props;
    Axios.get(api + "/training/statusList", {
      headers: { "x-access-token": token }
    }).then(res => {
      this.setState({ statusList: res.data.data });
    });
  };

  convertData = () => {
    const rawData = this.state.data;
    var data = {};
    rawData.forEach(row => {
      if (!data[row.status]) data[row.status] = [];
      data[row.status].push({
        x: row.year + "/" + row.month,
        y: row.count
      });
    });
    return data;
  };

  seriesData = () => {
    const { useCanvas } = this.state;
    const BarSeries = useCanvas ? VerticalBarSeriesCanvas : VerticalBarSeries;
    var series = [];
    const data = this.convertData();
    Object.keys(data).forEach(status => {
      series.push(<BarSeries key={status} color={color[status]} data={data[status]} />);
    });
    return series;
  };

  fetchChartData = () => {
    const { api, token, type } = this.props;
    Axios.get(api + "/training/statistics/trainings/" + type, {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  error = () => {
    const { error } = this.state;
    if (error) return <div className={styles.error}>{error.message}</div>;
    return null;
  };

  render() {
    const { data, statusList } = this.state;
    const { type } = this.props;

    if (!data || !statusList) return <div></div>;
    return (
      <div>
        <h3>Training: {type}</h3>
        <XYPlot xType="ordinal" width={400} height={300} stackBy="y">
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />

          {this.seriesData().map(series => {
            return series;
          })}
        </XYPlot>
      </div>
    );
  }
}

export default withRouter(ChartTrainings);
