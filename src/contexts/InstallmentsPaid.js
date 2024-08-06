import { collection, getDocs, query, where, getDoc, updateDoc, doc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import { parseCookies } from "nookies";
import Loading from "../components/loading";
import calcularParcelasRestantes from "../utils/parcelasRestantes";

const InstallmentsPaidContext = createContext({});

export default function InstallmentsPaidProvider({children}){
    const [loadingFunction, setLoadingFunction] = useState(true);


    async function updateShoppings() {
        const { '@creditmanage_token': authToken } = parseCookies();
        if (authToken) {
            const userDocRef = doc(db, 'Users', authToken);
            const shoppingQuery = query(collection(db, "Shoppings"), where("UserRef", '==', userDocRef));
            const getShoppings = await getDocs(shoppingQuery);
    
            if (!getShoppings.empty) {
                for (const item of getShoppings.docs) {
                    const shoppingData = item.data();
                    const cardRef = shoppingData.CardRef;
                    const personaRef = shoppingData.PersonaRef;

                    if (cardRef) {
                        const cardDoc = await getDoc(cardRef);
                        if (cardDoc.exists()) {
                            const cardData = cardDoc.data();
                            const onDay = new Date();
                            const getMonth = (onDay.getMonth() + 1);
                            const getDay = onDay.getDate();
                            const getYear = onDay.getFullYear();
                            const dayConvert  = `${getYear}-${getMonth}-${getDay}`;

                            const remainingInstallments = calcularParcelasRestantes(
                                shoppingData.ShoppingDate,
                                dayConvert,
                                cardData.PayDay,
                                shoppingData.Installments
                                );
                            if (remainingInstallments <= 0){
                                updateDoc(item.ref,{
                                    RemainingInstallments:0,
                                    IsFinished:true
                                });
                            }else{
                                updateDoc(item.ref,{
                                    RemainingInstallments:remainingInstallments,
                                    IsFinished:false
                                })
                            }
                            
                        } else {
                            return;
                        }
                    }
    
                    if (personaRef) {
                        const personaDoc = await getDoc(personaRef);
                        if (personaDoc.exists()) {
                            const personaData = personaDoc.data();
                            console.log('Persona Data:', personaData);
                        } else {
                            console.log('Persona document not found.');
                        }
                    }
                }
            } else {
                console.log('No shopping documents found.');
            }
        } else {
            console.log('No auth token found.');
        }
    }
    
    useEffect(()=>{
        updateShoppings().then(()=>{}).catch((error)=>{console.log(error)}).finally(()=>{setLoadingFunction(false)});
    },[]);

    if (loadingFunction){
        return <Loading/>
    }

    return(
        <InstallmentsPaidContext.Provider>
            {children}
        </InstallmentsPaidContext.Provider>
    )
}

export {InstallmentsPaidContext}; 