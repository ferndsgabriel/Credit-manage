import { collection, getDocs, query, where, getDoc, updateDoc, doc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import { parseCookies } from "nookies";
import Loading from "../components/loading";
import calcularParcelasRestantes from "../utils/parcelasRestantes";
import formatDateToYYYYMMDD from "../utils/formatDate";

const InstallmentsPaidContext = createContext({});

export default function InstallmentsPaidProvider({children}) {
    const [loadingFunction, setLoadingFunction] = useState(true);

    async function updateShoppings() {
        const { '@creditmanage_token': authToken } = parseCookies();
        if (authToken) {
            try {
                const userDocRef = doc(db, 'Users', authToken);
                const shoppingQuery = query(collection(db, "Shoppings"), where("UserRef", '==', userDocRef));
                const getShoppings = await getDocs(shoppingQuery);

                if (!getShoppings.empty) {
                    for (const item of getShoppings.docs) {
                        const shoppingData = item.data();
                        const cardRef = shoppingData.CardRef;
                        const personaRef = shoppingData.PersonaRef;

                        if (cardRef) {
                            try {
                                const cardDoc = await getDoc(cardRef);
                                if (cardDoc.exists()) {
                                    const cardData = cardDoc.data();
                                    const dataCompraFormatada = shoppingData.ShoppingDate;
                                    const remainingInstallments = calcularParcelasRestantes(
                                        cardData.PayDay, // diaFechamento
                                        dataCompraFormatada, // dataCompra
                                        shoppingData.Installments // totalParcelas
                                    );
                                    await updateDoc(item.ref, {
                                        RemainingInstallments: remainingInstallments > 0 ? remainingInstallments : 0,
                                        IsFinished: remainingInstallments <= 0
                                    });
                                } else {
                                    console.log('Card document not found.');
                                }
                            } catch (error) {
                                console.error('Error fetching card document:', error);
                            }
                        }

                        if (personaRef) {
                            try {
                                const personaDoc = await getDoc(personaRef);
                                if (personaDoc.exists()) {
                                    const personaData = personaDoc.data();
                                    console.log('Persona Data:', personaData);
                                } else {
                                    console.log('Persona document not found.');
                                }
                            } catch (error) {
                                console.error('Error fetching persona document:', error);
                            }
                        }
                    }
                } else {
                    console.log('No shopping documents found.');
                }
            } catch (error) {
                console.error('Error fetching shopping documents:', error);
            }
        } else {
            console.log('No auth token found.');
        }
    }

    useEffect(() => {
        updateShoppings().finally(() => setLoadingFunction(false));
    }, []);

    if (loadingFunction) {
        return <Loading />;
    }

    return (
        <InstallmentsPaidContext.Provider value={{ /* Pass any context values here */ }}>
            {children}
        </InstallmentsPaidContext.Provider>
    );
}

export { InstallmentsPaidContext };
