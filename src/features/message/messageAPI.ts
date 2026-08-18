import {getFirestore, query, collection, where, addDoc, onSnapshot, Timestamp} from "firebase/firestore";
import {firebaseApp} from '../../firebase/firebaseconfig';
import {Message, MessageRef} from "../../type/Message";

const db = getFirestore(firebaseApp);

// messages コレクションを監視する関数。
// 監視の仕組み（結果が何回も届くので return では表せず、預かった関数を届くたびに呼ぶ）は
// channelAPI.ts の subscribeChannels と同じで、違うのは対象を 1 チャンネルに絞る点。
//
// 第 2 引数の onMessagesUpdated は「MessageRef の配列を受け取り、何も返さない関数」という型。
// 中身はこのファイルには無く、呼び出し側が「データが届いたらこれをやってくれ」を関数の形で預ける
//（ChatList.tsx が subscribeChannels に対してやっているのと同じ形）
export const subscribeMessages = (channelID: string, onMessagesUpdated: (messages: MessageRef[]) => void) => {
    // where で channel_id が一致するものだけに絞る。全件を監視して画面側で捨てることもできるが、
    // それだと開いていないチャンネルへの投稿でも毎回コールバックが走る
    const q = query(collection(db, "messages"), where("channel_id", "==", channelID));

    // 戻り値は onSnapshot が返す「この監視をやめる関数」。
    // 止められるのは監視を始めた本人だけなので、そのまま呼び出し側へ渡して呼んでもらう
    return onSnapshot(q, (querySnapshot) => {
        const messageRefs: MessageRef[] = [];
        // firebaseのcollectionをforeachで回しながら取得
        querySnapshot.forEach((doc) => {
            messageRefs.push({
                // ドキュメント ID は本文の外にあり doc.data() には入っていないので、doc.id から別途取る
                id: doc.id,
                // doc.data() は中身の分からない型で返る。as は「Message として扱う」という宣言だけで
                // 実行時の検査は無く、保存されている形とずれるとその場では気付けない
                message: doc.data() as Message
            });
        });
        // ここが「結果を return する」の代わり。データが届くたび毎回ここを通り、預かった関数を呼ぶ
        onMessagesUpdated(messageRefs);
    }, (error) => {
        // 第 3 引数は監視が失敗したときに呼ばれる関数。
        // Firestore はここが呼ばれた時点で監視を終了し、自動では再開しない
        console.error("Failed to subscribe messages:", error);
    });
}

export const postMessage = async (message: Message) => {
    await addDoc(collection(db, "messages"), message);
}

export const createMessage = (
    userId: string,
    channelId: string,
    messageText: string
): Message => {
    const timestamp = Timestamp.fromDate(new Date());
    return {
        user_id: userId,
        channel_id: channelId,
        text: messageText,
        create_at: timestamp,
        is_edited: false,
        update_at: timestamp,
    };
};