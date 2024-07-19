import Header from "../../components/header";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import Loading from "../../components/loading";
import { MdModeEdit } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import CreatePersona from "../../components/modals/persona/createPersona";
import EditPersona from "../../components/modals/persona/editPersona";
import DeletePersona from "../../components/modals/persona/deletePersona";

function Persona() {
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;
    const [myPersonas, setMyPersonas] = useState([]);
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [personaName, setPersonaName] = useState('');
    const [personaId, setPersonaId] = useState('');

    async function getPersonas() {
        const userRef = doc(db, "Users", uid);
        const getPersonasQuery = query(collection(db, "Personas"), where('UserRef', '==', userRef));
        const findPersonas = await getDocs(getPersonasQuery);

        let list = [];
        if (!findPersonas.empty) {
            findPersonas.forEach((item) => {
                list.push(item.data());
            });
        }
        setMyPersonas(list);
    }

    function openModal() {
        setIsOpenCreate(true);
    }

    function closeModal() {
        setIsOpenCreate(false);
    }

    function openModalEdit(name, id) {
        setPersonaName(name);
        setPersonaId(id);
        setIsOpenEdit(true);
    }
    function closeModalEdit() {
        setPersonaName('');
        setPersonaId('');
        setIsOpenEdit(false);
    }

    function openModalDelete(name, id) {
        setPersonaName(name);
        setPersonaId(id);
        setIsOpenDelete(true);
    }
    function closeModalDelete() {
        setPersonaName('');
        setPersonaId('');
        setIsOpenDelete(false);
    }


    useEffect(() => {
        async function fetchData() {
            try {
                await getPersonas();
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [closeModal, closeModalEdit, closeModalDelete]);

    if (loading){
        return <Loading/>
    }

    return (
        <>
            <Header />
            <main className="flex flex-col w-full gap-8 px-4 py-12 mainScreen">
                <h1 className="pageTitle">Personas</h1>
                <section>
                    <button className="create" onClick={openModal}>
                        Criar
                    </button>
                    <CreatePersona isOpen={isOpenCreate} closeModal={closeModal} />
                </section>

                <section className="flex flex-col gap-4">
                    {myPersonas && myPersonas.length > 0 ? (
                        myPersonas.map((item, index) => (
                            <article key={index}
                                className="flex items-center justify-between w-full p-4 bg-dark4">
                                <p>{item.Name}</p>
                                <div className="flex items-center gap-4">
                                    <button onClick={()=>openModalEdit(item.Name, item.Id)}><MdModeEdit className="duration-200 hover:scale-110"/></button>
                                    <EditPersona isOpen={isOpenEdit} closeModal={closeModalEdit} personaId={personaId} personaName={personaName}/>
                                    <button onClick={()=>openModalDelete(item.Name, item.Id)}> <IoMdClose className="duration-200 hover:scale-110"/></button>
                                    <DeletePersona isOpen={isOpenDelete} closeModal={closeModalDelete} personaId={personaId} personaName={personaName}/>
                                </div>
                            </article>
                        ))
                    ) : (
                        <p className="text-dark6">Nenhuma persona cadastrada ainda :(</p>
                    )}
                </section>
            </main>
        </>
    )
}

export default Persona;
