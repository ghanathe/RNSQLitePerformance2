import React, { Component } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, Text, Dimensions } from 'react-native';
import { ListItem, Button } from 'react-native-elements';
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
} from 'react-native-chart-kit';
import Database from '../Database';

const db = new Database();

export default class HomeScreen extends Component {

    constructor() {
        super();
        this.state = {
            isLoading: true,
            errorMessage: ''
        };
    }

    componentDidMount() {
        this._subscribe = this.props.navigation.addListener('didFocus', async () => {
            await this.doTest();
        });
    }

    async doTest() {
        const data1 = await db.test(400, 50, 50);
        console.log(data1);
        const data2 = await db.test(500, 50, 50);
        console.log(data2);
        const data3 = await db.test(600, 50, 50);
        console.log(data3);
        const data4 = await db.test(700, 50, 50);
        console.log(data4);

        const data = {
            labels: ["400", "500", "600", "700"],
            legend: ["insert", "update", "delete", "select"],
            data: [
                [data1.insertTime, data1.updateTime, data1.deleteTime, data1.selectTime],
                [data2.insertTime, data2.updateTime, data2.deleteTime, data2.selectTime],
                [data3.insertTime, data3.updateTime, data3.deleteTime, data3.selectTime],
                [data4.insertTime, data4.updateTime, data4.deleteTime, data4.selectTime],
            ],
            barColors: ["#d4e68c", "#e68ce3", "#e6cd8c","#8cd4e6"]
          };
        this.setState({
            isLoading: false,
            data,
            version: data1.version,
        });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={styles.activity}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )
        }

        const chartConfig = {
            backgroundColor: "#a3999c",
            backgroundGradientFrom: "#c2b4b8",
            backgroundGradientTo: "#857a7d",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            decimalPlaces: 0,
            yAxisLabel: 'Time in ms',
            xAxisLabel: 'Records processed'
          };

        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <View><Text>Database version {this.state.version}</Text></View>
                <View><Text>Error Message {this.state.errorMessage}</Text></View>
                <View>
                    <StackedBarChart
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                        data={this.state.data}
                        width={Dimensions.get("window").width - 200} // from react-native
                        height={220}
                        chartConfig={chartConfig}
                        withVerticalLabels={true}
                        withHorizontalLabels={true}
                    />
                   
                </View>
                <Text style={styles.message}>{this.state.notFound}</Text>
            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 22
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    activity: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    message: {
        padding: 16,
        fontSize: 18,
        color: 'red'
    }
});