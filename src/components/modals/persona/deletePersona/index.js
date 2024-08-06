import { useState } from "react";
import Modal from "../../default";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AuthContext } from "../../../../contexts/AuthContext";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../firebase/config";

function DeletePersona({ isOpen, closeModal, personaId, personaName }) {
    const [loading, setLoading] = useState(false);
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;

    async function handleDelete(e) {
        e.preventDefault();

        setLoading(true);

        try {
            const id = parseInt(personaId);
            const queryItens = query(collection(db, "Personas"), where('Id', '==', id));
            const getQuery = await getDocs(queryItens);

            if (!getQuery.empty) {
                const firstDoc = getQuery.docs[0];
                const docRef = doc(db, "Personas", firstDoc.id);

                const queryShopping = query(collection(db, "Shopping"), where('PersonaRef', '==', docRef));
                const getShopping = await getDocs(queryShopping);

                if (!getShopping.empty) {
                    toast.warning('Não é possível deletar esta persona, pois há compras associadas a ela.');
                    setLoading(false);
                    closeModal();
                    return;
                } else {
                    await deleteDoc(docRef).then(() => {
                        toast.success('Persona deletada com sucesso');
                    }).catch(() => {
                        toast.error('Erro ao deletar persona');
                    }).finally(() => {
                        closeModal();
                    });
                }
            } else {
                toast.warning('Nenhuma persona encontrada com esse ID');
                closeModal();
            }
        } catch (error) {
            console.error("Erro ao deletar persona:", error);
            toast.error('Erro ao deletar persona');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modalContainer" onSubmit={handleDelete}>
                <h1>Deletar persona</h1>
                <p>Tem certeza que deseja deletar sua persona {personaName}?</p>
                <div className="formArea">
                    <div className="buttons">
                        <button className="create" disabled={loading} type="submit">Deletar</button>
                        {!loading ? (
                            <button onClick={closeModal} className="create">Cancelar</button>
                        ) : null}
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default DeletePersona;
