import TrezorConnect from 'trezor-connect';
import { validateAddress } from '@suite/utils/wallet/ethUtils';
import { NOTIFICATION } from '@wallet-actions/constants';
import messages from '@wallet-components/Notifications/actions.messages';
import { SIGN_VERIFY } from './constants';
import { Dispatch, GetState } from '@suite-types';

export type inputNameType =
    | 'signAddress'
    | 'signMessage'
    | 'signSignature'
    | 'verifyAddress'
    | 'verifyMessage'
    | 'verifySignature';

export type SignVerifyActions =
    | { type: typeof SIGN_VERIFY.SIGN_SUCCESS; signSignature: string }
    | { type: typeof SIGN_VERIFY.CLEAR_SIGN }
    | { type: typeof SIGN_VERIFY.CLEAR_VERIFY }
    | { type: typeof SIGN_VERIFY.INPUT_CHANGE; inputName: inputNameType; value: string }
    | { type: typeof SIGN_VERIFY.TOUCH; inputName: inputNameType }
    | { type: typeof SIGN_VERIFY.ERROR; inputName: inputNameType; message?: string };

export const sign = (path: [number], message: string, hex: boolean = false) => async (
    dispatch: Dispatch,
    getState: GetState,
) => {
    const selected = getState().suite.device;
    if (!selected) return;

    // @ts-ignore
    const response = await TrezorConnect.ethereumSignMessage({
        device: {
            path: selected.path,
            instance: selected.instance,
            state: selected.state,
        },
        path,
        hex,
        message,
        useEmptyPassphrase: selected.useEmptyPassphrase,
    });

    if (response && response.success) {
        dispatch({
            type: SIGN_VERIFY.SIGN_SUCCESS,
            signSignature: response.payload.signature,
        });
    } else {
        dispatch({
            type: NOTIFICATION.ADD,
            payload: {
                variant: 'error',
                title: messages.TR_SIGN_MESSAGE_ERROR,
                message: response.payload.error,
                cancelable: true,
            },
        });
    }
};

export const verify = (
    address: string,
    message: string,
    signature: string,
    hex: boolean = false,
) => async (dispatch: Dispatch, getState: GetState) => {
    const selected = getState().suite.device;
    if (!selected) return;
    const error = validateAddress(address);

    if (error) {
        dispatch({
            type: SIGN_VERIFY.ERROR,
            inputName: 'verifyAddress',
            message: error,
        });
    }

    if (!error) {
        // @ts-ignore // TODO ADD TO CONNECT
        const response = await TrezorConnect.ethereumVerifyMessage({
            device: {
                path: selected.path,
                instance: selected.instance,
                state: selected.state,
            },
            address,
            message,
            signature,
            hex,
            useEmptyPassphrase: selected.useEmptyPassphrase,
        });

        if (response && response.success) {
            dispatch({
                type: NOTIFICATION.ADD,
                payload: {
                    variant: 'success',
                    title: messages.TR_VERIFY_MESSAGE_SUCCESS,
                    message: messages.TR_SIGNATURE_IS_VALID,
                    cancelable: true,
                },
            });
        } else {
            dispatch({
                type: NOTIFICATION.ADD,
                payload: {
                    variant: 'error',
                    title: messages.TR_VERIFY_MESSAGE_ERROR,
                    message: response.payload.error,
                    cancelable: true,
                },
            });
        }
    }
};

export const inputChange = (inputName: inputNameType, value: string) => (dispatch: Dispatch) => {
    dispatch({
        type: SIGN_VERIFY.INPUT_CHANGE,
        inputName,
        value,
    });
    dispatch({
        type: SIGN_VERIFY.TOUCH,
        inputName,
    });

    if (inputName === 'verifyAddress') {
        const error = validateAddress(value);
        if (error) {
            dispatch({
                type: SIGN_VERIFY.ERROR,
                inputName,
                message: error,
            });
        }
    }
};

export const clearSign = (): SignVerifyActions => ({
    type: SIGN_VERIFY.CLEAR_SIGN,
});

export const clearVerify = (): SignVerifyActions => ({
    type: SIGN_VERIFY.CLEAR_VERIFY,
});
