import Modal from "../../default";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { db } from "../../../../firebase/config";
import { AuthContext } from "../../../../contexts/AuthContext";
import { useContext } from "react";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";

function DeleteCard({ isOpen, closeModal, item }) {
    const [loading, setLoading] = useState(false);
    const [indexColor, setIndexColor] = useState(0);
    const nameRef = useRef(null);
    const dayRef = useRef(null);
    const limitRef = useRef(null);
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;

    const colors = [
        '#33204E',
        '#67634D',
        '#2E3340',
        '#000000' 
    ];
    
    async function handleDelete(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const id = parseInt(item.Id);
            const queryItens = query(collection(db, "Cards"), where('Id', '==', id));
            const getQuery = await getDocs(queryItens);

            if (!getQuery.empty) {
                const firstDoc = getQuery.docs[0];
                const docRef = doc(db, "Cards", firstDoc.id);

                const queryShopping = query(collection(db, "Shoppings"), where('CardRef', '==', docRef));
                const getShopping = await getDocs(queryShopping);

                if (!getShopping.empty) {
                    toast.warning('Não é possível deletar este cartão, pois há compras associadas a ele.');
                    setLoading(false);
                    closeModal();
                    return;
                } else {
                    await deleteDoc(docRef).then(() => {
                        toast.success('cartão deletada com sucesso');
                    }).catch(() => {
                        toast.error('Erro ao deletar cartão');
                    }).finally(() => {
                        closeModal();
                    });
                }
            } else {
                toast.warning('Nenhuma cartão encontrado com esse ID');
                closeModal();
            }
        } catch (error) {
            console.error("Erro ao deletar cartão:", error);
            toast.error('Erro ao deletar cartão');
        } finally {
            setLoading(false);
        }
    }


    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modalContainer" onSubmit={handleDelete}>
                <h1>Deletar cartão</h1>
                <p>Tem certeza de que deseja excluir o cartão {item.Name}?</p>
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
    )
}

export default DeleteCard;
