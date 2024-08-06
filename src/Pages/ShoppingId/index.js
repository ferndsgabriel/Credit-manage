import { useEffect, useState, useContext, useRef } from "react";
import Header from "../../components/header";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/loading";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import DeleteShopping from "../../components/modals/shopping/deleteShopping";

function ShoppingId() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [loadingButton, setLoadingButton] = useState(false);
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;
    const userRef = doc(db, "Users", uid);
    const [cardsOptions, setCardsOptions] = useState([]);
    const [personaOptions, setPersonaOptions] = useState([]);
    const [shoppingData, setShoppingData] = useState(null);
    const [nameInput, setNameInput] = useState('');
    const [cardInput, setCardInput] = useState('');
    const [personaInput, setPersonaInput] = useState('');
    const [priceInput, setPriceInput] = useState(0);
    const [inputEdit, setInputEdit] = useState(true);
    const [shoppingRef, setShoppingRef] = useState(null);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [installmentInput, setInstallmentInput] = useState(null);
    const isMounted = useRef(false);

    function handleChangeCard(e) {
        const value = parseInt(e.target.value);
        setCardInput(value);
    }

    function handleChangePersona(e) {
        const value = parseInt(e.target.value);
        setPersonaInput(value);
    }

    function resetInputs() {
        setNameInput(shoppingData.Name);
        setCardInput(shoppingData.CardRef?.Id || '');
        setPersonaInput(shoppingData.PersonaRef?.Id || '');
        setPriceInput(shoppingData.Price);
        setInstallmentInput(shoppingData.Installments);
        setInputEdit(true);
    }

    function openModalDelete() {
        setIsOpenDelete(true);
    }
    
    function closeModalDelete() {
        setIsOpenDelete(false);
    }

    async function handleEdit(e) {
        e.preventDefault();
    
        if (!nameInput || !priceInput || !installmentInput || !personaInput || !cardInput) {
            toast.warning('Por favor, preencha todos os campos corretamente');
            return;
        }
        if (priceInput <= 0) {
            toast.warning('Por favor, insira um preço válido e maior que zero.');
            return;
        }
        
        if (installmentInput <= 0) {
            toast.warning('Por favor, insira uma parcela válida e maior que zero.');
            return;
        }
    
        setLoadingButton(true);
    
        try {
            const cardQuery = query(collection(db, 'Cards'), where('Id', '==', parseInt(cardInput)));
            const getCard = await getDocs(cardQuery);
            const personaQuery = query(collection(db, 'Personas'), where('Id', '==', parseInt(personaInput)));
            const getPersona = await getDocs(personaQuery);
            
            let firstCard = null;
            let firstPersona = null;
            if (!getCard.empty && !getPersona.empty) {
                firstCard = getCard.docs[0].ref;
                firstPersona = getPersona.docs[0].ref;
            } else {
                toast.error('Não foi possível encontrar o cartão ou a persona especificada.');
                return;
            }
    
            const cardDoc = await getDoc(firstCard);
            const getAvailable = cardDoc.data().Available;
            const newAvailable = parseInt((getAvailable + shoppingData.Price) - parseFloat(priceInput));
    
            if (newAvailable < 0) {
                toast.warning('Limite indisponível');
                return;
            }
    
            await updateDoc(shoppingRef, {
                Name: nameInput,
                Price: parseFloat(parseFloat(priceInput).toFixed(2)), 
                Installments: installmentInput,
                CardRef: firstCard,
                PersonaRef: firstPersona,
            });
    
            await updateDoc(firstCard, {
                Available: newAvailable
            });
    
            toast.success('Compra atualizada com sucesso');
            setInputEdit(true);
        } catch (error) {
            console.error("Erro ao atualizar compra:", error);
            toast.error('Erro ao atualizar compra');
        } finally {
            setLoadingButton(false);
        }
    }
    

    useEffect(() => {
        async function getOptionsCards() {
            const queryOptions = query(collection(db, "Cards"), where('UserRef', '==', userRef));
            const getQuery = await getDocs(queryOptions);
            if (!getQuery.empty) {
                const list = [];
                getQuery.forEach((item) => {
                    list.push(item.data());
                });
                setCardsOptions(list);
            }
        }
    
        async function getOptionsPersona() {
            const queryOptions = query(collection(db, "Personas"), where('UserRef', '==', userRef));
            const getQuery = await getDocs(queryOptions);
            if (!getQuery.empty) {
                const list = [];
                getQuery.forEach((item) => {
                    list.push(item.data());
                });
                setPersonaOptions(list);
            }
        }
    
        async function getWithId() {
            const myId = parseInt(id);
    
            if (!myId) {
                navigate('/');
                return;
            }
    
            const idQuery = query(collection(db, "Shoppings"),
                where('Id', '==', myId),
                where('UserRef', '==', userRef)
            );
            const getQuery = await getDocs(idQuery);
            if (getQuery.empty) {
                navigate('/');
                return;
            } else {
                const shoppingDoc = getQuery.docs[0];
                const shoppingData = shoppingDoc.data();
    
                let cardData = null;
                let personaData = null;
    
                if (shoppingData.CardRef) {
                    const cardDoc = await getDoc(shoppingData.CardRef);
                    cardData = cardDoc.data();
                }
    
                if (shoppingData.PersonaRef) {
                    const personaDoc = await getDoc(shoppingData.PersonaRef);
                    personaData = personaDoc.data();
                }
    
                setShoppingRef(shoppingDoc.ref);
                setShoppingData({
                    ...shoppingData,
                    CardRef: cardData,
                    PersonaRef: personaData
                });
    
                setNameInput(shoppingData.Name);
                setPriceInput(shoppingData.Price);
                setInstallmentInput(shoppingData.Installments);
                setCardInput(cardData ? cardData.Id : '');
                setPersonaInput(personaData ? personaData.Id : '');
            }
        }
    
        if (!isMounted.current) {
            getWithId().catch(error => {
                console.error('Error fetching shopping data:', error);
                navigate('/');
            }).finally(() => {
                setLoading(false);
            });

            getOptionsCards();
            getOptionsPersona();
            isMounted.current = true; 
        }
    }, [id, navigate, userRef]);

    if (loading) {
        return <Loading />;
    }
    
    return (
        <>
            <Header />
            <main className="flex flex-col w-full gap-8 px-4 py-12 mainScreen">
                <section>
                    {shoppingData ? (
                        <form className="flex flex-col gap-4" onSubmit={handleEdit}>
                            <article className="p-4 font-bold bg-gray-900">
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    disabled={inputEdit}
                                    className="w-full p-2 bg-transparent border-none outline-none max-w-96 enabled:bg-dark5"
                                    required={true}
                                    minLength={3}
                                    maxLength={30}
                                    autoFocus
                                />
                            </article>
    
                            <article className="grid grid-cols-2 gap-4 p-2 bg-gray-900">
                                <label className="flex flex-col gap-2 p-2">
                                        <p className="font-bold">Quem comprou:</p>
                                        <select
                                            className="w-full p-2 bg-transparent border-none outline-none max-w-96 enabled:bg-dark5"
                                            disabled={inputEdit}
                                            value={personaInput}
                                            onChange={handleChangePersona}
                                            required={true}
                                            >
                                            {personaOptions && personaOptions.length > 0 ? (
                                                personaOptions.map((item) => (
                                                    <option key={item.Id} value={item.Id}
                                                    className="text-black bg-gray-500">{item.Name}</option>
                                                ))
                                            ) : null}
                                        </select>
                                    </label>

                                <label className="flex flex-col gap-2 p-2">
                                    <p className="font-bold">Cartão:</p>
                                    <select
                                        className="w-full p-2 bg-transparent border-none outline-none max-w-96 enabled:bg-dark5"
                                        disabled={inputEdit}
                                        value={cardInput}
                                        onChange={handleChangeCard}
                                        required={true}
                                        >
                                        {cardsOptions && cardsOptions.length > 0 ? (
                                            cardsOptions.map((item) => (
                                                <option key={item.Id} value={item.Id}
                                                className="text-black bg-gray-500">{item.Name}</option>
                                            ))
                                        ) : null}
                                    </select>
                                </label>

                                <label className="flex flex-col gap-2 p-2">
                                    <p>Data:</p>
                                    <input
                                        value={shoppingData.ShoppingDate}
                                        disabled={true}
                                        className="w-full p-2 bg-transparent border-none outline-none max-w-96 enabled:bg-dark5"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 p-2">
                                    <p className="font-bold">Preço:</p>
                                    <input 
                                        placeholder="Digite o valor:" 
                                        className="w-full p-2 bg-transparent border-none outline-none max-w-96 enabled:bg-dark5"
                                        required={true} 
                                        minLength={3} 
                                        maxLength={30} 
                                        disabled={inputEdit}
                                        value={priceInput}
                                        onChange={(e)=>setPriceInput(e.target.value)}
                                        type="number"
                                        min={1}
                                    />
                                </label>
    
                                <label className="flex flex-col gap-2 p-2">
                                    <p className="font-bold">Parcelas:</p>
                                    <input 
                                        placeholder="Quantidade de parcelas:" 
                                        className="w-full p-2 bg-transparent border-none outline-none max-w-96 enabled:bg-dark5"
                                        required={true} 
                                        minLength={1} 
                                        maxLength={2} 
                                        disabled={true}
                                        value={installmentInput}
                                        onChange={(e)=>setInstallmentInput(e.target.value)}
                                        min={1}
                                        type="number"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 p-2">
                                    <p className="font-bold">Parcelas restantes:</p>
                                    <input 
                                        value={shoppingData.RemainingInstallments}
                                        disabled={true}
                                        className="w-full p-2 bg-transparent border-none outline-none max-w-96 enabled:bg-dark5"
                                    />
                                </label>

                            </article>
    
                            <div className="flex flex-col gap-2 mt-4">    
                                {inputEdit ? (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setInputEdit(false);
                                        }}
                                        className="w-full p-4 bg-dark4 hover:opacity-60"
                                        type="button"
                                    >
                                        Editar
                                    </button>
                                ) : (
                                    <button
                                        className="w-full p-4 bg-dark4 hover:opacity-60 
                                        disabled:text-[0] disabled:h-10 disabled:w-10 disabled:rounded-full disabled:border-solid 
                                        disabled:border-b-0 disabled:border-r-0 disabled:bg-transparent disabled:animate-spin duration-0"
                                        disabled={loadingButton}
                                        type="submit"
                                    >
                                        Salvar
                                    </button>
                                )}

                                {!inputEdit && !loadingButton && (
                                    <button
                                        onClick={resetInputs}
                                        className="w-full p-4 bg-dark4 hover:opacity-60"
                                        type="button"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                
                                {!loadingButton && (
                                    <button
                                        onClick={openModalDelete}
                                        className="w-full p-4 bg-dark4 hover:opacity-60"
                                        type="button"
                                    >
                                        Excluir
                                    </button>
                                )} 
                            </div>
                        </form>
                    ) : (
                        <p>Nenhum id encontrado :(</p>
                    )}
                    <DeleteShopping isOpen={isOpenDelete} closeModal={closeModalDelete}  shoppingRef={shoppingRef}/>
                </section>
            </main>
        </>
    );
    
}

export default ShoppingId;
