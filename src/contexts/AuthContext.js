import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { isEmail } from 'validator';
import { collection, getDocs, query, setDoc, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import FormatName from "../utils/formatName";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import zxcvbn from 'zxcvbn';
import { destroyCookie, parseCookies, setCookie } from "nookies";
import Loading from "../components/loading";

export const AuthContext = createContext({});

export default function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loadingPage, setLoadingPage] = useState(true);

    async function handleCreateUser(data) {
        if (!data.name || !data.lastname || !data.email || !data.pass) {
            toast.warning('Por favor, preencha todos os campos');
            return;
        }
        if (data.email.includes(' ')) {
            toast.warning('O e-mail não pode conter espaços');
            return;
        }
        if (!isEmail(data.email)) {
            toast.warning('Digite um email válido');
            return;
        }
        if (zxcvbn(data.pass).score < 3) {
            toast.warning('A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais');
            return;
        }

        const existEmailQuery = query(collection(db, "Users"), where('Email', '==', data.email.toLowerCase()));
        const existEmail = await getDocs(existEmailQuery);

        if (!existEmail.empty) {
            toast.warning('E-mail indisponível');
            return;
        }

        try {
            const createUser = await createUserWithEmailAndPassword(auth, data.email, data.pass);
            const uid = createUser.user.uid;

            const userDocRef = doc(db, "Users", uid);
            await setDoc(userDocRef, {
                Name: FormatName(data.name),
                LastName: FormatName(data.lastname),
                Email: data.email.toLowerCase(),
                Uid: uid
            }).then(() => {
                toast.success('Usuário criado com sucesso');
                navigate('/');
                return;
            }).catch((error) => {
                toast.error('Erro ao criar usuário');
                return;
            })
        } catch (error) {
            toast.error('Erro ao criar usuário');
            return;
        }
    }

    async function handleAuthUser(email, pass) {
        if (!email || !pass) {
            toast.warning('Por favor, preencha todos os campos');
            return;
        }
        if (!isEmail(email)) {
            toast.warning('Digite um email válido');
            return;
        }

        await signInWithEmailAndPassword(auth, email, pass).then(async (value) => {
            const uid = value.user.uid;
            const userDocRef = doc(db, "Users", uid);
            await getDoc(userDocRef).then((itens) => {
                let data = {
                    Name: itens.data().Name,
                    LastName: itens.data().LastName,
                    Email: itens.data().Email,
                    Uid: itens.data().Uid
                }
                setUserData(data);
                setCookie(undefined, "@creditmanage_token", itens.data().Uid, {
                    maxAge: 60 * 60 * 24 * 30,
                    path: "/",
                })
            })
        }).catch((err) => {
            toast.error('Erro ao logar');
            return;
        });
    }

    function signout() {
        try {
            destroyCookie(undefined, '@creditmanage_token');
            setUserData(null);
            navigate('/');
        } catch (error) {
            console.log('Erro ao deslogar');
        }
    }

    async function sendCodRecovery(email) {
        if (!email) {
            toast.warning('Digite seu e-mail');
            return;
        }

        if (!isEmail(email)) {
            toast.warning('Digite um email válido');
            return;
        }

        const emailQuery = query(collection(db, "Users"), where('Email', '==', email));
        const getEmail = await getDocs(emailQuery);

        if (getEmail.empty) {
            toast.warning('E-mail não encontrado');
            return;
        } else {
            await sendPasswordResetEmail(auth, email).then(() => {
                toast.success('Enviamos um e-mail de recuperação para seu endereço de e-mail.');
                return;
            }).catch(() => {
                toast.error('Erro ao recuperar senha');
            })
        }
    }

    useEffect(() => {
        async function getUser() {
            const { '@creditmanage_token': authToken } = parseCookies();

            if (!authToken) {
                setUserData(null);
            } else {
                const userDocRef = doc(db, 'Users', authToken);
                await getDoc(userDocRef).then((itens) => {
                    let data = {
                        Name: itens.data().Name,
                        LastName: itens.data().LastName,
                        Email: itens.data().Email,
                        Uid: itens.data().Uid
                    }
                    setUserData(data);
                    setCookie(undefined, "@creditmanage_token", itens.data().Uid, {
                        maxAge: 60 * 60 * 24 * 30,
                        path: "/",
                    })
                }).catch((error) => {
                    signout()
                })
            }
            setLoadingPage(false);
        }

        try {
            getUser();
        } catch (error) {
            console.log(error)
            setLoadingPage(false);
        }
    }, [])

    if (loadingPage) {
        return <Loading />
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!userData,
            userData,
            handleCreateUser,
            handleAuthUser,
            signout,
            sendCodRecovery
        }}>
            {children}
        </AuthContext.Provider>
    )
}
