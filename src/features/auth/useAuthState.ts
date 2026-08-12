// このファイルの役割:
// Firebase に「今ログインしているのは誰か」を監視してもらい、変化があったら Redux 側に反映する。
// 画面は持たない（タグを返さない）ので拡張子は .tsx ではなく .ts。
//
// 読む前に、Redux の言葉を 5 つだけ整理しておく。このファイルはこの 5 つで出来ている。
//
//   store    アプリ全体で共有したい値をまとめて置いておく箱。1 アプリに 1 つ。実体は app/store.ts。
//   state    その箱の中身（今の値）。このアプリでは { user: { userId: "" } } という形をしている。
//   action   「何が起きたか」を表すただのオブジェクト。{ type: "userId/login", payload: "uid文字列" } の形。
//            命令ではなく報告に近く、これを作っただけでは何も起きない。
//   reducer  action を受け取って「次の state」を決める関数。(今の state, action) => 次の state。
//            state を書き換えてよいのは reducer の中だけ、というのが Redux のルール。
//   dispatch action を store に届ける関数。届いた時点で store が reducer を呼び、state が入れ替わる。
//
// 値が動く向きは一方通行で、ぐるっと一周して画面に戻ってくる。
//
//   dispatch(action) → store が reducer を呼ぶ → state が変わる → その state を見ている画面が描き直される
//
// この一方通行のおかげで「誰がいつ state を変えたか」が action の名前で追える。
// state を直接書き換える方法を用意しないのは、追えなくなるのを防ぐため。

import { useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { auth } from './auth';
import { login, logout } from '../user/userSlice';

// use で始まる名前の関数 = React のフック。
// 中で useEffect などのフックを呼ぶ関数は、自分も use から始める決まりになっている。
//
// このフックは値も画面も返さない。App.tsx で 1 回呼んでもらい、監視を仕掛けることだけが仕事。
const useAuthState = () => {
    // useAppDispatch() の戻り値は、上で説明した dispatch（action を store に届ける関数）そのもの。
    // dispatch という変数に「関数が入っている」ので、下のほうで dispatch(...) と呼び出せる。
    //
    // どの store に届けるかを引数で渡していないのは、index.tsx の <Provider store={store}> が
    // アプリ全体に store を配っていて、フックがそこから受け取るため。
    //
    // 返ってくる関数は store が同じなら毎回同じもの（参照が変わらない）。
    // だから最後の依存配列 [dispatch] は、実質「初回だけ実行」と同じ意味になる。
    const dispatch = useAppDispatch();

    // useEffect(実行したい処理, 依存配列) の 2 引数。
    // 通信・購読・タイマーのような「画面を描くこと以外の処理」を担当する。
    //
    // 第 1 引数の () => { ... } は関数を値として渡しているだけで、この行では実行されない。
    // React が画面を描き終えたあとに呼び出す。描画の途中で外部と通信するのを避けるための仕組み。
    //
    // 第 2 引数の [dispatch] は「この中身が前回と変わっていたら、もう一度実行し直す」という指定。
    // [] なら初回のみ、第 2 引数ごと省略すると再描画のたびに毎回実行される。
    useEffect(() => {
        // Firebase Authの認証状態の変更を監視するイベントリスナーを登録
        //
        // 引数に渡した関数は自分では呼ばない。ログイン状態が変わったときに Firebase 側から呼ばれる。
        // このように「あとで相手に呼んでもらうために渡す関数」をコールバックと呼ぶ。
        //
        // 呼ばれるのはログイン時・ログアウト時に加えて、登録した直後にも現在の状態で 1 回。
        // リロードしてもログインが続くのは、この直後の 1 回で uid が再び store に入るため
        // （ログイン状態そのものは Firebase がブラウザに保存していて、Redux の state はリロードで消える）。
        //
        // 戻り値の unsubscribe は「この監視をやめるための関数」。
        const unsubscribe = auth.onAuthStateChanged((loginUser) => {
            // loginUser に型を書いていないが、onAuthStateChanged 側の型定義から
            // User | null と推論される（引数に型注釈が要らないのはこのため）。
            if (loginUser) {
                // ユーザーがログインしている場合、ユーザーIDをReduxストアに保存
                //
                // 関数呼び出しが 2 段になっている点がこの行の読みどころ。
                // 内側の login(uid) は { type: "userId/login", payload: uid } という action を作るだけ。
                // それを外側の dispatch(...) に渡して初めて store に届き、reducer が state.user.userId を uid にする。
                dispatch(login(loginUser.uid));
            } else {
                // ユーザーがログアウトしている場合、ユーザーIDをReduxストアから削除
                //
                // logout() は payload を持たない action。reducer 側で userId を空文字に戻す。
                // App.tsx は state.user.userId を見て画面を出し分けているので、ここでログイン画面に戻る。
                dispatch(logout());
            }
        });

        // コンポーネントがアンマウントされた際にイベントリスナーを解除
        //
        // useEffect に渡した関数が関数を return すると、React はそれを後片付け用として覚えておき、
        // コンポーネントが消えるとき（と、依存配列が変わって実行し直す直前）に呼んでくれる。
        // 解除しないと、画面から消えたあとも Firebase が通知を送り続けて監視が積み上がる。
        return () => unsubscribe();
    }, [dispatch]);

    // 値を返さないフックなので、この return は書かなくても動作は同じ。
    return;
}

export default useAuthState;
