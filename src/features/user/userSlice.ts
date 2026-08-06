import { createSlice } from "@reduxjs/toolkit";
import {signInWithGoogle} from "../auth/auth";
import {getUser, postUser} from "./userAPI";
import {User} from "../../type/User";

const initialState = {
    userId: ""
}

export const googleSignInAndUserSetup= async() => {
    try {
        const result = await signInWithGoogle();
        const login_user = result.user;
        const user = await getUser(login_user.uid);
        // 未ログインのユーザーならpostUserしusersコレクションにsetDocする
        if (!user) {
            // User型のnewUser
            const newUser: User = {
                profile_picture: login_user.photoURL ?? "",
                email: login_user.email ?? "",
                displayName: login_user.displayName ?? "",
            }

            await postUser({
                uid: login_user.uid,
                user: newUser
            });
        }
        return login_user.uid;
    } catch(error) {
        console.log('LoginFailed:', error);
    }
};

//Note:
//
// userSlice.ts では、login、logout のそれぞれで state.userId を直接更新しています。
// Redux の状態はイミュータブルである必要があるため、直接の状態更新は推奨されていません。
// しかし、Redux Toolkit の createSlice を使用すると、内部でImmer ライブラリが利用されるため、
// このように状態を「直接更新するような」コードを書いても問題ありません。
//
// Immer とは、JavaScript のイミュータブルな状態更新を簡単に行うためのライブラリで、Redux Toolkit に内包されており、
// 個別に Immer をインストールする必要はありません。createSlice や createReducer などの API は、内部的に Immer を使用しており、
// 開発者が直接的な状態変更を行うコードを書いても、イミュータブルな更新を自動で行ってくれます。
export const userSlice = createSlice({
    name: "userId",
    initialState,
    reducers: {
        login: (state, action) => {
            state.userId = action.payload;
        },
        logout: (state) => {
            state.userId = "";
        }
    }
})

export const {login, logout} = userSlice.actions;
export default userSlice.reducer;