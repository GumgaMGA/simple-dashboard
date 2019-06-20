import { BaseHighChart } from '../base';
import { RecordSet } from '../../common/interfaces';
import { Configuration } from '../../common/configuration';
import { CommonProvider } from '../../common/providers';

export class Line extends BaseHighChart {

    private categories: Array<string>;
    private series: Array<any>;

    protected onInit() {
        this.categories = new Array();
        this.series = new Array();
    }

    protected processRecordSet(recordset: RecordSet, configuration: Configuration) {
        recordset.rows.forEach(row => {
            let categorieValue = row[this.getPosition(configuration.axisX.name)];
            this.addCategorie(categorieValue);
        });
        if (configuration.dynamicColumns) {
            configuration.axisY = [];
            this.recordset.columns
                .filter((column) => configuration.axisX.name != column)
                .forEach((column) => configuration.axisY.push({ name: column, label: column }));
        }
        configuration.axisY.forEach(axisY => {
            if (axisY && axisY.name) {
                let indexAxisY = this.getPosition(axisY.name), values: Array<any> = [], colorAxisY = undefined;
                recordset.rows.forEach((row, index) => {
                    let value = row[indexAxisY];
                    values.push(Number(value));
                    if (index == recordset.rows.length - 1) {
                        colorAxisY = this.getConditionFormatDataColor(axisY.name, row[indexAxisY], configuration, row);
                    }
                });
                let color = colorAxisY ? colorAxisY : axisY.color ? axisY.color.value : undefined;
                this.addSerie(axisY.label ? axisY.label : axisY.name, values, color, configuration);
            }
        });
    }

    private getConditionFormatDataColor(name, value, configuration: Configuration, row) {
        var color = undefined;
        configuration
            .conditionalsFormatting
            .filter(function (data) {
                return data.field == name
            })
            .forEach((data) => {
                if (data.compareOtherField) {
                    data.value = row[this.getPosition(data.fieldCompare)];
                }
                if (CommonProvider.isConditionalFormatting(data.condition, value, data.value)) {
                    color = data.color.value;
                }
            })
        return color;
    }


    protected getHighChartConfiguration(configuration: Configuration) {
        return {
            colors: configuration.dynamicColumns && configuration.colorPalette ? CommonProvider.getColorByPaletteKey(configuration.colorPalette, configuration.invertedColorPalette) : CommonProvider.getColorsPaletteDefault(configuration.invertedColorPalette),
            chart: {
                type: 'areaspline',
                backgroundColor: configuration.backgroundColor,
                borderRadius: '8px',
                margin: [0, -12, 0, -12],
                zoomType: false,
                reflow: true,
                spacingBottom: 24,
                spacingLeft: 24,
                spacingRight: 24,
                spacingTop: 24,
            },
            title: {
                text: configuration && configuration.title ? configuration.title : '',
                style: {
                    fontSize: (this.getFontSize() + 7) + "px",
                    color: '#666',
                    fontFamily: '"Montserrat", sans-serif',
                }
            },
            lang: {
                noData: "Sem dados para apresentar"
            },
            subtitle: {
                text: '',
                x: -20
            },
            xAxis: {
                lineWidth: 0,
                minorTickLength: 0,
                tickLength: 0,
                minorGridLineWidth: 0,
                categories: this.categories,
                title: {
                    text: configuration ? configuration.axisX.label : 'Titulo do eixo horizontal'
                },
                labels: {
                    itemStyle: {
                        color: '#aaa',
                        pointerEvents: 'none',
                        textTransform: 'uppercase',
                        fontWeight: '100',
                        fontFamily: '"Montserrat", sans-serif',
                        verticalAlign: 'middle'
                    },
                    formatter: function () {
                        let mask = configuration.axisX && configuration.axisX.format ? configuration.axisX.format : configuration.format;
                        return CommonProvider.formatValue(this.value, mask, configuration.axisX.formatPrecision);
                    },
                }
            },
            legend: {
                align: 'right',
                verticalAlign: 'top',
                navigation: {
                    enabled: false
                },
                layout: 'horizontal',
                itemStyle: {
                    fontSize: this.getFontSize() + "px",
                    color: '#666',
                    fontWeight: '100',
                    fontFamily: '"Montserrat", sans-serif',
                },
                enabled: configuration ? configuration.showLegendAxisY : true
            },
            yAxis: {
                minPadding: 0,
                gridLineWidth: configuration.showGridLineWidthAxisY ? 1 : 0,
                title: {
                    text: '',
                    enabled: false
                },
                labels: {
                    enabled: true,
                    floating: true,
                    align: 'left',
                    style: {
                        color: '#ababab',
                        fontWeight: 'bold',
                        fontFamily: '"Montserrat", sans-serif',
                    },
                    x: 34,
                    y: 30,
                    formatter: function () {
                        return CommonProvider.formatValue(this.value, configuration.format, configuration.formatPrecision)
                    },
                    itemStyle: {
                        fontSize: this.getFontSize() + "px",
                        color: '#666',
                        fontWeight: '100',
                        fontFamily: '"Montserrat", sans-serif',
                    }
                }
            },
            tooltip: {
                enabled: configuration ? configuration.dataLabelAxisY : false,
                formatter: function () {
                    return CommonProvider.formatValue(this.y, configuration.format, configuration.formatPrecision)
                },
                borderRadius: 20,
                backgroundColor: 'currentColor',
                borderWidth: 2,
                borderColor: 'currentColor',
                shadow: true,
                style: {
                    color: 'white',
                    fontWeight: '400',
                    fontFamily: '"Montserrat", sans-serif',
                },
                headerFormat: '<span></span>'
            },
            exporting: {
                enabled: false
            },
            series: this.series,
            pane: {
                size: '100%',
                center: ['100%', '100%']
            },
            plotOptions: {
                series: {
                    margin: 0,
                    pointPadding: 0,
                    groupPadding: 0,
                    borderWidth: 0,
                    shadow: false
                },
                line: {
                    padding: 0,
                    align: 'left',
                    dataLabels: {
                        enabled: configuration ? configuration.dataLabelAxisY : true,
                        formatter: function () {
                            return CommonProvider.formatValue(this.y, configuration.format, configuration.formatPrecision)
                        },
                        style: {
                            fontSize: this.getFontSize() + "px"
                        }
                    },
                    showInLegend: configuration ? configuration.showLegendAxisY : true
                }
            },
            credits: {
                enabled: false
            }
        }
    }

    private addCategorie(name: string): void {
        this.categories.push(name);
    }

    private addSerie(name: string, values: Array<any>, color: string, configuration: Configuration): void {
        this.series.push({
            type: configuration.fillLine ? 'areaspline' : 'spline',
            lineWidth: configuration.fillLine ? 0 : 2,
            name: name,
            marker: {
                enabled: false
            },
            data: values,
            color: color,
            dataLabels: {}
        });
    }

}
