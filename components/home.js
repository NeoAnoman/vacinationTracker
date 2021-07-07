import React from 'react';
import { Text, View, Button, TextInput, } from 'react-native';

export default function Home() {
    const [pin,setPin]= React.useState('');
    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('details')
            if(value !== null) {
                alert(value)
            }
            else {
                alert('Please enter information to check!!!')
            }
        } catch(e) {
            alert(e)
        }
    }
    const storeData = async (value) => {
        try {
            var value = {
                pin: pin
            }
            const jsonValue = JSON.stringify()
            await AsyncStorage.setItem('details', jsonValue)
        } catch (e) {
            alert(e)
        }
    }
    
    return(
        <View>
            <Text
                style={{
                    textAlign: 'center'
                }}
            >
                Enter Your Pin
            </Text>
            <TextInput style={{ height: 60, textAlign: 'center',
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
                        <Button style={{marginTop: 20}} title="Submit" />
                    </View>
                    <View>
                        <Button  title="Enter By Area" />
                    </View>
            </View>
        </View>
    )
}