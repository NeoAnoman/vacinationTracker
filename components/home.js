import React from 'react';
import { Text, View, Button, TextInput, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Home(props) {
    const [pin,setPin]= React.useState('');
    const [data,setData]= React.useState('');
    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('details')
            if (value !== null) {
                var data = JSON.parse(value)
                alert(value)
                setData(data)
            }
            else {
                alert('Please enter information to check!!!')
            }
        } catch(e) {
            alert(e)
        }
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
                props.navigation.navigate('Display', value)
            } catch (e) {
                alert(e)
            }
        }
    }
    React.useEffect(() => {
        getData()
    }, []); //replecating componentDidMount Behaviou
    return(
        <View style={{marginTop: 50, alignItems: 'center' }}>
            <Text
                style={{
                    textAlign: 'center',
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
                        <Button onPress={()=>storeData(props)} style={{marginTop: 20}} title="Submit" />
                    </View>
                    <View>
                        <Button title="Enter By Area" />
                    </View>
            </View>
        </View>
    )
}