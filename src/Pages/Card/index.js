import Header from "../../components/header";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import Loading from "../../components/loading";
import { MdEdit } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import CreateCard from "../../components/modals/card/createCard";
import EditCard from "../../components/modals/card/editCard";
import DeleteCard from "../../components/modals/card/deleteCard";


function Card() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [itens, setItens] = useState({});

    
    function openModal() {
        setIsOpen(true);
    }
    function closeModal() {
        setIsOpen(false);
    }

    function openModalEdit(item) {
        setItens(item)
        setIsOpenEdit(true);
    }
    function closeModalEdit() {
        setItens({})
        setIsOpenEdit(false);
    }

    function openModalDelete(item) {
        setItens(item)
        setIsOpenDelete(true);
    }
    function closeModalDelete() {
        setItens({})
        setIsOpenDelete(false);
    }

    useEffect(() => {
        async function getCards() {
            if (!uid) {
                console.error("User ID não está definido.");
                setLoading(false);
                return;
            }

            try {
                const userRef = doc(db, "Users", uid);
                const cardQuery = query(collection(db, 'Cards'), where('UserRef', '==', userRef));
                const cardDocs = await getDocs(cardQuery);

                if (!cardDocs.empty) {
                    const list = cardDocs.docs.map(doc => doc.data());
                    setCards(list);
                } else {
                    setCards([]);
                }
            } catch (error) {
                console.error("Erro ao buscar cartões:", error);
            } finally {
                setLoading(false);
            }
        }

        getCards();
    }, [closeModal, closeModalEdit, closeModalDelete]);

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <Header />
            <main className="flex flex-col w-full gap-8 px-4 py-12 mainScreen">
                <h1 className="pageTitle">Cartões</h1>
                <section>
                    <button className="create" onClick={openModal}>
                        Criar
                    </button>
                    <CreateCard isOpen={isOpen} closeModal={closeModal}/>
                </section>

                <section className="flex flex-col gap-4">
                    {cards.length > 0 ? (
                        <article className="flex flex-col flex-wrap items-start gap-4 md:flex-row border-dark5">
                            {cards.map((item, index) => (
                                <div key={index} className={`bg-[${item.Color}] p-4 rounded-2xl flex flex-col gap-32 w-full max-w-md aspect-card border-2 border-dark5`}>
                                    <div className="flex items-center justify-end gap-2 text-xl">
                                        <button onClick={()=>openModalEdit(item)}><MdEdit className="duration-200 hover:scale-110"/></button>
                                        <EditCard isOpen={isOpenEdit} closeModal={closeModalEdit} item={itens}/>
                                        <button onClick={()=>openModalDelete(item)}><IoMdClose className="duration-200 hover:scale-110"/></button>
                                        <DeleteCard isOpen={isOpenDelete} closeModal={closeModalDelete} item={itens}/>
                                    </div>
                                    
                                    <div>
                                        <p>Fechamento: dia {item.PayDay}</p>
                                        <p className="text-2xl font-bold"
                                        >{item.Name}</p>
                                    </div>
                                </div>
                            ))}
                        </article>
                    ) : (
                        <p className="text-dark6">Nenhum cartão cadastrado ainda :(</p>
                    )}
                </section>
            </main>
        </>
    );
}

export default Card;
