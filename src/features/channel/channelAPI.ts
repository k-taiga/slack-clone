import {
    getFirestore,
    query,
    collection,
    onSnapshot,
} from "firebase/firestore";
import { firebaseApp } from "../../firebase/firebaseconfig";
import { Channel, ChannelRef } from "../../type/Channel";

// firebaseApp（接続設定）から Firestore を操作するための入り口を 1 つだけ作る。
// 以降の collection / query / onSnapshot はすべてこの db を起点にたどっていく
const db = getFirestore(firebaseApp);

// channels コレクションを「監視」する関数。
//
// Firestore からのデータ取得には 2 通りある。
//   1 回だけ取る（getDocs）  … 結果が 1 回で確定するので、戻り値で返せる
//   変化を監視する（onSnapshot）… 他人がチャンネルを追加するたび結果が届く。何回届くか事前に分からない
// チャットは他人の追加を即座に画面へ出したいので後者を使う。
// ただし「何回も届くもの」は return では表現できない（return は 1 回きり）。
// そこで結果の渡し方をひっくり返し、呼び出し側から渡された関数を届くたびに呼ぶ形にする
export const subscribeChannels = (
    // 「ChannelRef の配列を受け取り、何も返さない関数」という型。
    // この関数自身がここで実行されるのではなく、あとで（データが届いたとき）呼ばれる。
    // 呼び出し側は「データが届いたらこれをやってくれ」という処理を関数の形で預けることになる
    onChannelsUpdated: (channels: ChannelRef[]) => void
) => {
    // collection(db, "channels") は「どの置き場を見るか」の指定、query(...) は「どう絞るか」の指定。
    // ここでは where も orderBy も付けていないので channels 全件が対象。
    // 条件なしでも query() で包むのは、onSnapshot が Query を受け取る形の API のため
    const q = query(collection(db, "channels"));

    // onSnapshot は監視を始めると同時に「その監視をやめる関数」を返してくる。
    // 監視は放っておくと画面を離れたあとも生き続け、
    // 消えたはずの画面向けにデータが届き続ける（通信もリスナーも残る）。
    // それを止められるのは監視を始めた本人だけなので、止めるための関数をそのまま呼び出し側へ返し、
    // 呼び出し側（React なら useEffect のクリーンアップ）で呼んでもらう
    return onSnapshot(
        q,
        // 第 2 引数はデータが届いたときに呼ばれる関数。
        // 監視を始めた直後に現在の全件で 1 回呼ばれ、以降は channels が変わるたびに呼ばれる。
        // 初回も呼ばれるので、初期表示のために getDocs を別で書く必要はない
        (querySnapshot) => {
            // 届いた querySnapshot は Firestore の形（ID と本文が別々）なので、
            // 画面で扱う形（ChannelRef = id + channel）へ 1 件ずつ詰め替える。その積み先。
            // 毎回この場で新しい配列を作るのは、前回の配列を書き換えて渡すと
            // React / Redux 側が「同じ配列＝変化なし」と見なして再描画しないことがあるため
            const channelRefs: ChannelRef[] = [];
            // querySnapshot 自体は配列ではないので map は使えない。
            // 用意されている forEach でドキュメントを 1 件ずつ取り出し、上の配列へ積んでいく
            querySnapshot.forEach((doc) => {
                channelRefs.push({
                    // Firestore ではドキュメント ID が本文（フィールド）の外にあり、doc.data() には入っていない。
                    // ID が無いと「どのチャンネルを開いたか」を指せないので、doc.id から取って一緒に持たせる
                    id: doc.id,
                    // doc.data() は「何のフィールドが入っているか分からない」型で返ってくる。
                    // Firestore 側に型の情報が無く TypeScript も中身を知れないため、
                    // as で「これは Channel として扱う」と宣言している。
                    // 実行時に中身が検査されるわけではないので、保存されている形とこの型がずれると実行時に壊れる
                    channel: doc.data() as Channel,
                });
            });
            // 組み立て終わった一覧を、預かっていた関数に渡す。
            // ここが「結果を return する」の代わりで、届くたびに毎回ここを通る
            onChannelsUpdated(channelRefs);
        },
        // 第 3 引数は監視が失敗したときに呼ばれる関数（権限エラーなど）。
        // Firestore はここが呼ばれた時点で監視を終了し、自動では再開しない。
        // 渡さないとエラーが握りつぶされ「画面が更新されないが原因が分からない」状態になる
        (error) => {
            console.error("Failed to subscribe channels:", error);
        }
    );
};