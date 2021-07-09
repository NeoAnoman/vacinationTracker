import React from 'react';
import { Text, View, Button, TextInput, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const BACKGROUND_FETCH_TASK = 'background-fetch';


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

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
      var data  = await getData();
      if(data.pin) {
          
      }
      const receivedNewData = '// do your background fetch here'
      return receivedNewData ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
  } 
  catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});



export default function Home(props) {
    const [pin,setPin]= React.useState('');
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(null);
    const [items, setItems] = React.useState([
        {label: '1 hour', value: 1},
        {label: '2 hours', value: 2},
        {label: '3 hours', value: 3},
        {label: '4 hours', value: 4},
        {label: '5 hours', value: 5},
    ]);


    const [isRegistered, setIsRegistered] = React.useState(false);
    const [status, setStatus] = React.useState(null);



    const checkStatusAsync = async () => {
        const status = await BackgroundFetch.getStatusAsync();
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
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
        await storeData();
        return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            minimumInterval: 60 * 15, // 15 minutes
            stopOnTerminate: false, // android only,
            startOnBoot: true, // android only
        });
    }

    // 3. (Optional) Unregister tasks by specifying the task name
    // This will cancel any future background fetch calls that match the given name
    // Note: This does NOT need to be in the global scope and CAN be used in your React components!
    async function unregisterBackgroundFetchAsync() {
        return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }

    const storeData = async (props) => {
        if(!pin) {
                alert('Please enter the pin')
                return;
            }
        else {
            try {
                var value = {
                    pin: pin
                }
                const jsonValue = JSON.stringify(value)
                await AsyncStorage.setItem('details', jsonValue)
            } catch (e) {
                alert(e)
            }
        }
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
        <View style={{alignItems: 'center', marginTop: 20}}>
            <Text
                style={{
                    textAlign: 'center',
                    fontSize: 20
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
                borderColor: 'blue', color: 'blue'}} 
                variant='outlined' 
                placeholder='pin' 
                onChangeText={text=> setPin(text)}
                />
            <View style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <View 
                        style={{
                            marginRight: 20
                        }}
                    >
                        <Button onPress={()=>{
                            var value = {
                                pin: pin
                            }
                            props.navigation.navigate('Display', value)
                        }} style={{marginTop: 20}} title="Submit" />
                    </View>
                    <View>
                        <Button title="Enter By Area" />
                    </View>
            </View>
            <View
                style={{
                    marginTop: 80,
                    alignItems: 'center'
                }}
            >
                <Text style={{textAlign: 'center', fontSize: 20, marginBottom: 20}} >
                    OR Set an Interval To check
                </Text>
                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    containerStyle= {{width: '50%'}}
                />
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