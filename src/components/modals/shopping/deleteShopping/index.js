import { deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import Modal from "../../default";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function DeleteShopping({ isOpen, closeModal, shoppingRef }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function handleDelete(e) {
        e.preventDefault();
        setLoading(true);
        
        await deleteDoc(shoppingRef).then(()=>{
            toast.success('Compra deletada com sucesso');
            navigate('/');
        }).catch((error)=>{
            toast.error('Erro ao deletar compra');
            console.log(error)
        }).finally(()=>{
            setLoading(false);
            closeModal();
        });
    }

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modalContainer" onSubmit={handleDelete}>
                <h1>Deletar compra</h1>
                <p>Tem certeza de que deseja deletar essa compra?</p>
                <div className="formArea">
                    <div className="buttons">
                        <button className="create" disabled={loading} type="submit">Deletar</button>
                        {!loading ? (
                            <button onClick={closeModal} className="create" type="button">Cancelar</button>
                        ) : null}
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default DeleteShopping;
