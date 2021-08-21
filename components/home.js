import React from 'react';
import { Text, View, Button, TextInput, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import {Picker} from '@react-native-picker/picker';


const BACKGROUND_FETCH_TASK = 'background-fetch2';


const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('details')
            if (value !== null) {
                var data = JSON.parse(value)
                return data;
            }
            else {
                alert('Please enter information to check!!!')
            }
        } catch(e) {
            alert(e)
        }
    }
const getOldData = async () => {
        try {
            const value = await AsyncStorage.getItem('oldDetails')
            if (value !== null) {
                var data = JSON.parse(value)
                return data;
            }
            else {
                return null
            }
        } catch(e) {
            console.log(e)
        }
    }

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
const storeResults = async (props) => {
        try {
            var value = props
            console.log(value)
            const jsonValue = JSON.stringify(value)
            await AsyncStorage.setItem('oldDetails', jsonValue)
            return 1;
        } catch (e) {
            console.log(e)
            return 0;
        }
    }

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    // const now = Date.now();

    // console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);

    // // Be sure to return the successful result type!
    // return BackgroundFetch.Result.NewData;
  try {
      console.log('background')
      var data  = await getData();
      var date = new Date
      var oldData = await getOldData();
      if(data.pin) {
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
            date = day+'-'+month+'-'+year;
            if(data.setBackAsPin) {
                var api = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode="+data.pin+"&date="+date;
            }
            else {
                var api  = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id="+data.district+"&date="+date
            }
            console.log(api)
            await fetch(api)
            .then((res)=> res.json())
            .then(async (data)=> {
                console.log(data)
                console.log('background')
                if(oldData) {
                    console.log('We have some old data', oldData)
                    if(data.sessions.length > oldData.sessions.length) {
                        console.log('new Data has more items')
                    }
                    else {
                        console.log('same or equal number of items')
                    }
                    await storeResults(data);
                }
                else {
                    console.log('Storing data');
                    await storeResults(data);
                }
            })
            .catch((e)=> {
                console.log(e)
            })
            
      }
      console.log('background out')
      const receivedNewData = '// do your background fetch here'
      return receivedNewData ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
  } 
  catch (error) {
      console.log(error)
      return BackgroundFetch.Result.Failed;
  }
});



export default function Home(props) {
    const [pin,setPin]= React.useState('');
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(null);
    const [showPin, setShowPin] = React.useState(true);
    const [items, setItems] = React.useState([
        {label: '1 hour', value: 1},
        {label: '2 hours', value: 2},
        {label: '3 hours', value: 3},
        {label: '4 hours', value: 4},
        {label: '5 hours', value: 5},
    ]);
    const [state, setState] = React.useState(null);
    const [allStates, setAllStates] = React.useState(null);

    const [district, setDistrict] = React.useState(null);
    const [allDistricts, setAllDistricts] = React.useState(null);


    const [isRegistered, setIsRegistered] = React.useState(false);
    const [status, setStatus] = React.useState(null);



    const checkStatusAsync = async () => {
        const status = await BackgroundFetch.getStatusAsync();
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
        console.log('status', status);
        setStatus(status);
        setIsRegistered(isRegistered);
    };

    const toggleFetchTask = async () => {
        if (isRegistered) {
        await unregisterBackgroundFetchAsync();
        } else {
        await registerBackgroundFetchAsync();
        }

        checkStatusAsync();
    };

    // 2. Register the task at some point in your app by providing the same name, and some configuration options for how the background fetch should behave
    // Note: This does NOT need to be in the global scope and CAN be used in your React components!
    async function registerBackgroundFetchAsync() {
        if(await storeData()) {
            console.log('I am registering')
            return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
                minimumInterval: 0.1, // 15 minutes after the app is in background
                // stopOnTerminate: false, // android only,
                startOnBoot: true, // android only
            });
        }
    }

    // 3. (Optional) Unregister tasks by specifying the task name
    // This will cancel any future background fetch calls that match the given name
    // Note: This does NOT need to be in the global scope and CAN be used in your React components!
    async function unregisterBackgroundFetchAsync() {
        return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }

    const storeData = async (props) => {
        if(!pin && !district) {
                alert('Please enter the pin or location')
                return 0;
            }
        else {
            try {
                var value = {
                    pin: pin,
                    district: district,
                    setBackAsPin: showPin?1:0
                }
                const jsonValue = JSON.stringify(value)
                await AsyncStorage.setItem('details', jsonValue)
                return 1;
            } catch (e) {
                alert(e)
                return 0;
            }
        }
    }
    
    const fetchStates = async () => {
        setAllStates(null)
        var api = "https://cdn-api.co-vin.in/api/v2/admin/location/states"
        console.log("start to fetch")
        fetch(api, {
            headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
            }
        })
        .then((res) => res.json())
        .then((data) => {
            setAllStates(data)
        })
        .catch((err) => {console.log(err)})
    }

    const fetchDistricts = async (value) => {
        setAllStates(null)
        var api = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/"+ value
        console.log("start to fetch districts")
        fetch(api, {
            headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
            }
        })
        .then((res) => res.json())
        .then((data) => {
            setAllDistricts(data)
        })
        .catch((err) => {console.log(err)})
    }

    React.useEffect(() => {
        checkStatusAsync();
        const func = async () => {
            var data  = await getData();
            console.log(data)
        }
        func();
    }, []); //replecating componentDidMount Behaviou
    return(
        <View style={{alignItems: 'center', 
            marginTop: 20, 
            backgroundColor: '#ABC', 
            height: '100%'
            }}>
            {
            showPin?
            <View style={{width: '100%', alignItems: 'center'}}>
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: 20,
                        color: '#fff'
                    }}
                >
                    Enter Your Pin
                </Text>
                <TextInput style={{ height: 60, 
                    width: '50%',
                    textAlign: 'center',
                    borderColor: 'gray', 
                    borderWidth: 1, fontSize: 20,
                    marginTop: 20,
                    marginBottom: 20,
                    borderColor: 'blue',
                    color: '#fff'}} 
                    variant='outlined' 
                    placeholder='pin' 
                    onChangeText={text=> setPin(text)}
                    />
            </View>
            :<View style={{width: '100%', alignItems: 'center'}}>
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: 20,
                        color: '#fff'
                    }}
                >
                    Select your Area
                </Text>
                <Picker
                    style = {{height: 100, width: '50%', color: '#fff'}}
                    selectedValue={state}
                    onValueChange={(itemValue, itemIndex) => {
                        if(itemValue != state) {
                            fetchDistricts(itemValue)
                        }
                        setState(itemValue)
                        setAllStates(allStates)
                    }
                    }>
                    {allStates?allStates.states.map((item) => (
                        <Picker.Item label={item.state_name} value={item.state_id} key={item.state_id}/>
                    )):<Picker.Item label="Please wait while Fetching" value="Empty" />}
                    
                </Picker>
                {allDistricts?<Picker
                    style = {{height: 100, width: '50%', color: '#fff'}}
                    selectedValue={district}
                    onValueChange={(itemValue, itemIndex) => {
                        setDistrict(itemValue)
                        setAllDistricts(allDistricts)
                    }
                    }>
                    {allDistricts.districts.map((item) => (
                        <Picker.Item label={item.district_name} value={item.district_id} key={item.district_id}/>
                    ))}
                    
                </Picker>:null}
            </View>
            }
            <View style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <View 
                        style={{
                            marginRight: 20
                        }}
                    >
                        {showPin?<Button onPress={()=>{
                            var value = {
                                pin: pin
                            }
                            props.navigation.navigate('Display', value)
                        }} style={{marginTop: 20}} title="Submit" />:
                        <Button onPress={()=>{
                            var value = {
                                district: district
                            }
                            console.log(value)
                            props.navigation.navigate('Display', value)
                        }} style={{marginTop: 20}} title="Submit" />
                        }
                    </View>
                    <View>
                        {showPin?<Button onPress= {() => 
                                {
                                    setShowPin(!showPin)
                                    if(allStates == null) {
                                        fetchStates()
                                    }
                            }} title="Enter By Area" />
                        :<Button onPress= {() => 
                               {setShowPin(!showPin)}} 
                            title="Enter By Pin" />}
                    </View>
            </View>
            <View
                style={{
                    marginTop: 80,
                    alignItems: 'center',
                    width: '100%'
                }}
            >
                <Text style={{textAlign: 'center', fontSize: 20, marginBottom: 20}} >
                    OR Set an Interval To check
                </Text>
                <Picker
                    style = {{height: 60, width: '50%'}}
                    selectedValue={value}
                    onValueChange={(itemValue, itemIndex) => {
                        setValue(itemValue)
                    }}>
                    {
                    items.map((item)=> (
                        <Picker.Item label={item.label} value={item.value} key={100 +  item.value}/>
                    ))}
                </Picker>
            </View>
            <View
                style={{marginTop: 20}}
            >
                <Button
                    title={isRegistered ? 'Unregister BackgroundFetch task' : 'Register BackgroundFetch task'}
                    onPress={toggleFetchTask}
                />
            </View>
        </View>
    )
}