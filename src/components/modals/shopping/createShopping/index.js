import Modal from "../../default";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { db } from "../../../../firebase/config";
import { AuthContext } from "../../../../contexts/AuthContext";
import { useContext } from "react";
import { addDoc, collection, doc, getDocs, query, where, getDoc } from "firebase/firestore";
import Loading from "../../../loading";
import formatDateToYYYYMMDD from "../../../../utils/formatDate";
import calcularParcelasRestantes from "../../../../utils/parcelasRestantes";

function CreateShopping({ isOpen, closeModal }) {
    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;
    const nameRef = useRef(null);
    const priceRef = useRef(null);
    const installmentRef = useRef(null);
    const personaRef = useRef(null);
    const cardRef = useRef(null);
    const date = new Date();
    const [shoppingDate, setShoppingDate] = useState(formatDateToYYYYMMDD(date));
    const [optionsPersonas, setOptionsPersonas] = useState([]);
    const [optionsCards, setOptionsCards] = useState([]);

    
    async function getPersonas() {
        const userRef = doc(db, "Users", uid);
        const queryPersona = query(collection(db, 'Personas'), where('UserRef', '==', userRef));
        const getQuery = await getDocs(queryPersona);

        if (!getQuery.empty) {
            let list = [];
            getQuery.forEach((item) => {
                list.push({ id: item.id, ...item.data() });
            });
            setOptionsPersonas(list);
        }
    }

    async function getCards() {
        const userRef = doc(db, "Users", uid);
        const queryCard = query(collection(db, 'Cards'), where('UserRef', '==', userRef));
        const getQuery = await getDocs(queryCard);

        if (!getQuery.empty) {
            let list = [];
            getQuery.forEach((item) => {
                list.push({ id: item.id, ...item.data() });
            });
            setOptionsCards(list);
        }
    }
        
    async function handleCreate(e) {
        e.preventDefault();
        
        const nameValue = nameRef.current?.value;
        const priceValue = parseFloat(priceRef.current?.value); 
        const installmentValue = parseInt(installmentRef.current?.value); 
        const personaValue = parseInt(personaRef.current?.value); // Convertido para número
        const cardValue = parseInt(cardRef.current?.value); // Convertido para número
        
        if (!nameValue || isNaN(priceValue) || isNaN(installmentValue) || !personaValue || !cardValue) {
            toast.warning('Por favor, preencha todos os campos corretamente');
            return;
        }
        if (priceValue <= 0) {
            toast.warning('Por favor, insira um preço válido e maior que zero.');
            return;
        }
        
        if (installmentValue <= 0) {
            toast.warning('Por favor, insira uma parcela válida e maior que zero.');
            return;
        }
        
        setLoading(true);
    
        try {
            const cardQuery = query(collection(db, 'Cards'), where('Id', '==', cardValue));
            const getCard = await getDocs(cardQuery);
    
            const personaQuery = query(collection(db, 'Personas'), where('Id', '==', personaValue));
            const getPersona = await getDocs(personaQuery);
            
            if (getCard.empty || getPersona.empty) {
                setLoading(false);
                toast.error('Não foi possível encontrar o cartão ou a persona especificada.');
                return;
            }
    
            const firstCard = getCard.docs[0].ref;
            const firstPersona = getPersona.docs[0].ref; // Captura a referência da persona corretamente
    
            const userRef = doc(db, "Users", uid);
            const timestamp = new Date().getTime();    
            const cardDoc = await getDoc(firstCard);
            const getAvaliable = cardDoc.data().Available;
            const newAvaliable = parseInt(getAvaliable) - priceValue;
    
            if (newAvaliable < 0) {
                toast.warning('Limite indisponível');
                setLoading(false);
                return;
            }
    
            const remainingInstallments = calcularParcelasRestantes(shoppingDate, formatDateToYYYYMMDD(new Date()), firstCard.PayDay, installmentValue);
    
            await addDoc(collection(db, "Shoppings"), {
                Id: timestamp,
                Name: nameValue,
                Price: priceValue.toFixed(2),
                Installments: installmentValue,
                ShoppingDate: shoppingDate,
                UserRef: userRef,
                CardRef: firstCard,
                PersonaRef: firstPersona, // Garantindo que a referência da persona não é nula
                RemainingInstallments: remainingInstallments,
                IsFinished: false
            });
    
            toast.success('Compra registrada com sucesso');
            closeModal();
        } catch (error) {
            console.error("Erro ao registrar compra:", error);
            toast.error('Erro ao registrar compra');
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        if (isOpen) {
            try {
                getPersonas();
                getCards();
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingPage(false);
            }
        }else{
            setShoppingDate(formatDateToYYYYMMDD(date));
        }
    }, [isOpen]);


    return (
        <>
            <Modal isOpen={isOpen} closeModal={closeModal}>
                {!loadingPage ? (
                    <form className="modalContainer" onSubmit={handleCreate}>
                        <h1>Registrar compra</h1>
                        <p>Registre suas compras e mantenha-se em dia com suas dívidas.</p>
                        <div className="formArea">
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-2">
                                    <p>Quem comprou?</p>
                                    <select className="typeText" ref={personaRef} required={true}>
                                        {optionsPersonas && optionsPersonas.length > 0 ? (
                                            optionsPersonas.map((item, index) => (
                                                <option key={index} value={item.Id}>{item.Name}</option>
                                            ))
                                        ) : null}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-2">
                                    <p>Em qual cartão?</p>
                                    <select className="typeText" required={true} ref={cardRef}>
                                        {optionsCards && optionsCards.length > 0 ? (
                                            optionsCards.map((item, index) => (
                                                <option key={index} value={item.Id}>{item.Name}</option>
                                            ))
                                        ) : null}
                                    </select>
                                </label>

                                <label className="flex flex-col gap-2">
                                    <p>O que comprou?</p>
                                    <input 
                                        placeholder="Digite o nome da compra:" 
                                        className="typeText" 
                                        required={true} 
                                        minLength={3} 
                                        maxLength={30} 
                                        autoFocus={true}
                                        ref={nameRef}
                                    />
                                </label>
                                
                                <label className="flex flex-col gap-2">
                                    <p>Quando comprou?</p>
                                    <input 
                                        placeholder="Data da compra:" 
                                        className="typeText" 
                                        required={true} 
                                        type="date"
                                        value={shoppingDate}
                                        onChange={(e) => setShoppingDate(e.target.value)}
                                    />
                                </label>
                                
                                <label className="flex flex-col gap-2">
                                    <p>Quanto custou?</p>
                                    <input 
                                        placeholder="Digite o valor:" 
                                        className="typeText" 
                                        required={true} 
                                        minLength={3} 
                                        maxLength={30} 
                                        ref={priceRef}
                                        type="number"
                                        min={1}
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <p>Em quantas parcelas?</p>
                                        <input 
                                        placeholder="Quantidade de parcelas:" 
                                        className="typeText" 
                                        required={true} 
                                        minLength={1} 
                                        maxLength={2} 
                                        defaultValue={1}
                                        min={1}
                                        ref={installmentRef}
                                        type="number"
                                    />
                                </label>


                            </div>
                            <div className="buttons">
                                <button className="create" disabled={loading} type="submit">Criar</button>
                                {!loading ? (
                                    <button onClick={closeModal} className="create">Cancelar</button>
                                ) : null}
                            </div>
                        </div>
                    </form>
                ) : (
                    <Loading/>
                )}

            </Modal>
        </>
    );
}

export default CreateShopping;
