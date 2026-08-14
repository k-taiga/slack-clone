import {Timestamp} from 'firebase/firestore';

export type Channel = {
    name: string,
    created_at: Timestamp,
}

export type ChannelRef = {
    id: string,
    channel: Channel,
}