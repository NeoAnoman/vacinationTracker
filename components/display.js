import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';


export default function Display(props) {
    const [data,setData]= React.useState('');
    
    const getData = () => {
        var pin  = props.route.params.pin;
        var district = props.route.params.district
        var date = new Date
        if(pin || district) {
            var day = date.getDate()
            var month = date.getMonth()
            var year = date.getFullYear()
            var last = new Date(year, month + 1, 0)
            if(day == last.getDate()) {
                day = 1
                if(month == 11) {
                    month = 0
                    year = year + 1
                }
                else {
                    month = month+1
                }
            }
            else {
                day = day+1
            }
            if(month == 11) {
                month = 0
                year = year+1
            }
            else {
                month = month+1
            }
            if((day/10) < 1) {
                day= '0'+day
            }
            if((month/10) < 1) {
                month= '0'+month
            }
            date = day+'-'+month+'-'+year
            if(pin) {
                var api = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode="+pin+"&date="+date
            }
            else {
                var api  = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id="+district+"&date="+date
            }
            console.log(api)
            fetch(api)
            .then((res)=> res.json())
            .then(async (data)=> {
                if(data.sessions.length) {
                    var table = null
                    var ar = [['Name', 'Address', 'slots', 'Vaccine',' ', 'Name', 'Address', 'slots', 'fees', 'Vaccine']]
                    var free= []
                    var paid= []
                    await data.sessions.forEach((item)=> {
                        if(item.fee_type == "Free") {
                            free.push(item)
                        }
                        else {
                            paid.push(item)
                        }
                    })
                    var n= free.length>paid.length?free.length:paid.length
                    console.log(n)
                    for(var i=0; i<n; i++) {
                        if(free[i]) {
                            var c= 1
                            await free[i].slots.forEach((item)=> {
                                ar.push([c?free[i].name:' ', c?free[i].address:' ', item, c?free[i].vaccine:' '])
                                c= 0
                            })
                        }
                        if(paid[i]) {
                            c= 1
                            await paid[i].slots.forEach((item)=> {
                                ar.push([' ', ' ', ' ', ' ',' ',c?paid[i].name:' ', c?paid[i].address:' ', item, c?paid[i].fee:' ',c?paid[i].vaccine:' '])
                                c= 0
                            })
                        }
                    }
                    table = {
                        tableHead: ['FREE Centers', ' ', ' ', ' ', ' ', 'PAID Centers', ' ', ' ', ' ', ' '],
                        tableData: ar,
                        widthArr: [100,100,100,100,100,100,100,100,100,100]
                    }
                }
                setData(table)
            })
            .catch((e)=> console.log(e))
        }
    }
    React.useEffect(() => {
        getData()
    }, []); //replecating componentDidMount Behaviou
    if(data) {
        return (
            <ScrollView
                showsHorizontalScrollIndicator = {true}
                horizontal = {true}
            >
                <View>
                    <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                        <Row data={data.tableHead} widthArr={data.widthArr} style={{ height: 40, backgroundColor: '#f1f8ff' }} textStyle={{margin: 6}}/>
                    </Table>
                    <ScrollView>
                        <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                            <Rows data={data.tableData} widthArr={data.widthArr} textStyle={{margin: 6}}/>
                        </Table>
                    </ScrollView>
                </View>
            </ScrollView>
        )
    }
    else {
        return (
            <View>
                <Text>Please wait 15 seconds to Load if still nothing happens then No Centers Availaible</Text>
            </View>
        )
    }
}