import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type Register = {
    $$type: 'Register';
    referrer: Address;
}

export function storeRegister(src: Register) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(256, 32);
        b_0.storeAddress(src.referrer);
    };
}

export function loadRegister(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 256) { throw Error('Invalid prefix'); }
    const _referrer = sc_0.loadAddress();
    return { $$type: 'Register' as const, referrer: _referrer };
}

export function loadTupleRegister(source: TupleReader) {
    const _referrer = source.readAddress();
    return { $$type: 'Register' as const, referrer: _referrer };
}

export function loadGetterTupleRegister(source: TupleReader) {
    const _referrer = source.readAddress();
    return { $$type: 'Register' as const, referrer: _referrer };
}

export function storeTupleRegister(source: Register) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.referrer);
    return builder.build();
}

export function dictValueParserRegister(): DictionaryValue<Register> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRegister(src)).endCell());
        },
        parse: (src) => {
            return loadRegister(src.loadRef().beginParse());
        }
    }
}

export type BuyTable = {
    $$type: 'BuyTable';
    tableNum: bigint;
}

export function storeBuyTable(src: BuyTable) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(257, 32);
        b_0.storeUint(src.tableNum, 8);
    };
}

export function loadBuyTable(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 257) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    return { $$type: 'BuyTable' as const, tableNum: _tableNum };
}

export function loadTupleBuyTable(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    return { $$type: 'BuyTable' as const, tableNum: _tableNum };
}

export function loadGetterTupleBuyTable(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    return { $$type: 'BuyTable' as const, tableNum: _tableNum };
}

export function storeTupleBuyTable(source: BuyTable) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    return builder.build();
}

export function dictValueParserBuyTable(): DictionaryValue<BuyTable> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBuyTable(src)).endCell());
        },
        parse: (src) => {
            return loadBuyTable(src.loadRef().beginParse());
        }
    }
}

export type ChangeMaster = {
    $$type: 'ChangeMaster';
    newMaster: Address;
    coSigner: Address;
}

export function storeChangeMaster(src: ChangeMaster) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(512, 32);
        b_0.storeAddress(src.newMaster);
        b_0.storeAddress(src.coSigner);
    };
}

export function loadChangeMaster(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 512) { throw Error('Invalid prefix'); }
    const _newMaster = sc_0.loadAddress();
    const _coSigner = sc_0.loadAddress();
    return { $$type: 'ChangeMaster' as const, newMaster: _newMaster, coSigner: _coSigner };
}

export function loadTupleChangeMaster(source: TupleReader) {
    const _newMaster = source.readAddress();
    const _coSigner = source.readAddress();
    return { $$type: 'ChangeMaster' as const, newMaster: _newMaster, coSigner: _coSigner };
}

export function loadGetterTupleChangeMaster(source: TupleReader) {
    const _newMaster = source.readAddress();
    const _coSigner = source.readAddress();
    return { $$type: 'ChangeMaster' as const, newMaster: _newMaster, coSigner: _coSigner };
}

export function storeTupleChangeMaster(source: ChangeMaster) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newMaster);
    builder.writeAddress(source.coSigner);
    return builder.build();
}

export function dictValueParserChangeMaster(): DictionaryValue<ChangeMaster> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeMaster(src)).endCell());
        },
        parse: (src) => {
            return loadChangeMaster(src.loadRef().beginParse());
        }
    }
}

export type ConfirmAdminAction = {
    $$type: 'ConfirmAdminAction';
    actionId: bigint;
}

export function storeConfirmAdminAction(src: ConfirmAdminAction) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(513, 32);
        b_0.storeUint(src.actionId, 32);
    };
}

export function loadConfirmAdminAction(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 513) { throw Error('Invalid prefix'); }
    const _actionId = sc_0.loadUintBig(32);
    return { $$type: 'ConfirmAdminAction' as const, actionId: _actionId };
}

export function loadTupleConfirmAdminAction(source: TupleReader) {
    const _actionId = source.readBigNumber();
    return { $$type: 'ConfirmAdminAction' as const, actionId: _actionId };
}

export function loadGetterTupleConfirmAdminAction(source: TupleReader) {
    const _actionId = source.readBigNumber();
    return { $$type: 'ConfirmAdminAction' as const, actionId: _actionId };
}

export function storeTupleConfirmAdminAction(source: ConfirmAdminAction) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.actionId);
    return builder.build();
}

export function dictValueParserConfirmAdminAction(): DictionaryValue<ConfirmAdminAction> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeConfirmAdminAction(src)).endCell());
        },
        parse: (src) => {
            return loadConfirmAdminAction(src.loadRef().beginParse());
        }
    }
}

export type ChangeSystemWallet = {
    $$type: 'ChangeSystemWallet';
    newSystemWallet: Address;
    coSigner: Address;
}

export function storeChangeSystemWallet(src: ChangeSystemWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(514, 32);
        b_0.storeAddress(src.newSystemWallet);
        b_0.storeAddress(src.coSigner);
    };
}

export function loadChangeSystemWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 514) { throw Error('Invalid prefix'); }
    const _newSystemWallet = sc_0.loadAddress();
    const _coSigner = sc_0.loadAddress();
    return { $$type: 'ChangeSystemWallet' as const, newSystemWallet: _newSystemWallet, coSigner: _coSigner };
}

export function loadTupleChangeSystemWallet(source: TupleReader) {
    const _newSystemWallet = source.readAddress();
    const _coSigner = source.readAddress();
    return { $$type: 'ChangeSystemWallet' as const, newSystemWallet: _newSystemWallet, coSigner: _coSigner };
}

export function loadGetterTupleChangeSystemWallet(source: TupleReader) {
    const _newSystemWallet = source.readAddress();
    const _coSigner = source.readAddress();
    return { $$type: 'ChangeSystemWallet' as const, newSystemWallet: _newSystemWallet, coSigner: _coSigner };
}

export function storeTupleChangeSystemWallet(source: ChangeSystemWallet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newSystemWallet);
    builder.writeAddress(source.coSigner);
    return builder.build();
}

export function dictValueParserChangeSystemWallet(): DictionaryValue<ChangeSystemWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeSystemWallet(src)).endCell());
        },
        parse: (src) => {
            return loadChangeSystemWallet(src.loadRef().beginParse());
        }
    }
}

export type UpgradeLogic = {
    $$type: 'UpgradeLogic';
    newCode: Cell;
    coSigner: Address;
}

export function storeUpgradeLogic(src: UpgradeLogic) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(515, 32);
        b_0.storeRef(src.newCode);
        b_0.storeAddress(src.coSigner);
    };
}

export function loadUpgradeLogic(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 515) { throw Error('Invalid prefix'); }
    const _newCode = sc_0.loadRef();
    const _coSigner = sc_0.loadAddress();
    return { $$type: 'UpgradeLogic' as const, newCode: _newCode, coSigner: _coSigner };
}

export function loadTupleUpgradeLogic(source: TupleReader) {
    const _newCode = source.readCell();
    const _coSigner = source.readAddress();
    return { $$type: 'UpgradeLogic' as const, newCode: _newCode, coSigner: _coSigner };
}

export function loadGetterTupleUpgradeLogic(source: TupleReader) {
    const _newCode = source.readCell();
    const _coSigner = source.readAddress();
    return { $$type: 'UpgradeLogic' as const, newCode: _newCode, coSigner: _coSigner };
}

export function storeTupleUpgradeLogic(source: UpgradeLogic) {
    const builder = new TupleBuilder();
    builder.writeCell(source.newCode);
    builder.writeAddress(source.coSigner);
    return builder.build();
}

export function dictValueParserUpgradeLogic(): DictionaryValue<UpgradeLogic> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpgradeLogic(src)).endCell());
        },
        parse: (src) => {
            return loadUpgradeLogic(src.loadRef().beginParse());
        }
    }
}

export type EmergencyWithdraw = {
    $$type: 'EmergencyWithdraw';
    amount: bigint;
    to: Address;
    coSigner: Address;
}

export function storeEmergencyWithdraw(src: EmergencyWithdraw) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(516, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.to);
        b_0.storeAddress(src.coSigner);
    };
}

export function loadEmergencyWithdraw(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 516) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _to = sc_0.loadAddress();
    const _coSigner = sc_0.loadAddress();
    return { $$type: 'EmergencyWithdraw' as const, amount: _amount, to: _to, coSigner: _coSigner };
}

export function loadTupleEmergencyWithdraw(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _to = source.readAddress();
    const _coSigner = source.readAddress();
    return { $$type: 'EmergencyWithdraw' as const, amount: _amount, to: _to, coSigner: _coSigner };
}

export function loadGetterTupleEmergencyWithdraw(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _to = source.readAddress();
    const _coSigner = source.readAddress();
    return { $$type: 'EmergencyWithdraw' as const, amount: _amount, to: _to, coSigner: _coSigner };
}

export function storeTupleEmergencyWithdraw(source: EmergencyWithdraw) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.to);
    builder.writeAddress(source.coSigner);
    return builder.build();
}

export function dictValueParserEmergencyWithdraw(): DictionaryValue<EmergencyWithdraw> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEmergencyWithdraw(src)).endCell());
        },
        parse: (src) => {
            return loadEmergencyWithdraw(src.loadRef().beginParse());
        }
    }
}

export type SetPaused = {
    $$type: 'SetPaused';
    paused: boolean;
}

export function storeSetPaused(src: SetPaused) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(517, 32);
        b_0.storeBit(src.paused);
    };
}

export function loadSetPaused(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 517) { throw Error('Invalid prefix'); }
    const _paused = sc_0.loadBit();
    return { $$type: 'SetPaused' as const, paused: _paused };
}

export function loadTupleSetPaused(source: TupleReader) {
    const _paused = source.readBoolean();
    return { $$type: 'SetPaused' as const, paused: _paused };
}

export function loadGetterTupleSetPaused(source: TupleReader) {
    const _paused = source.readBoolean();
    return { $$type: 'SetPaused' as const, paused: _paused };
}

export function storeTupleSetPaused(source: SetPaused) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.paused);
    return builder.build();
}

export function dictValueParserSetPaused(): DictionaryValue<SetPaused> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPaused(src)).endCell());
        },
        parse: (src) => {
            return loadSetPaused(src.loadRef().beginParse());
        }
    }
}

export type SetCoSigner = {
    $$type: 'SetCoSigner';
    coSigner: Address;
}

export function storeSetCoSigner(src: SetCoSigner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(518, 32);
        b_0.storeAddress(src.coSigner);
    };
}

export function loadSetCoSigner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 518) { throw Error('Invalid prefix'); }
    const _coSigner = sc_0.loadAddress();
    return { $$type: 'SetCoSigner' as const, coSigner: _coSigner };
}

export function loadTupleSetCoSigner(source: TupleReader) {
    const _coSigner = source.readAddress();
    return { $$type: 'SetCoSigner' as const, coSigner: _coSigner };
}

export function loadGetterTupleSetCoSigner(source: TupleReader) {
    const _coSigner = source.readAddress();
    return { $$type: 'SetCoSigner' as const, coSigner: _coSigner };
}

export function storeTupleSetCoSigner(source: SetCoSigner) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.coSigner);
    return builder.build();
}

export function dictValueParserSetCoSigner(): DictionaryValue<SetCoSigner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetCoSigner(src)).endCell());
        },
        parse: (src) => {
            return loadSetCoSigner(src.loadRef().beginParse());
        }
    }
}

export type EventSlotFilled = {
    $$type: 'EventSlotFilled';
    tableNum: bigint;
    slotNum: bigint;
    owner: Address;
    source: Address;
    amount: bigint;
}

export function storeEventSlotFilled(src: EventSlotFilled) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(768, 32);
        b_0.storeUint(src.tableNum, 8);
        b_0.storeUint(src.slotNum, 8);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.source);
        b_0.storeCoins(src.amount);
    };
}

export function loadEventSlotFilled(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 768) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    const _slotNum = sc_0.loadUintBig(8);
    const _owner = sc_0.loadAddress();
    const _source = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    return { $$type: 'EventSlotFilled' as const, tableNum: _tableNum, slotNum: _slotNum, owner: _owner, source: _source, amount: _amount };
}

export function loadTupleEventSlotFilled(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _slotNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _source = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'EventSlotFilled' as const, tableNum: _tableNum, slotNum: _slotNum, owner: _owner, source: _source, amount: _amount };
}

export function loadGetterTupleEventSlotFilled(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _slotNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _source = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'EventSlotFilled' as const, tableNum: _tableNum, slotNum: _slotNum, owner: _owner, source: _source, amount: _amount };
}

export function storeTupleEventSlotFilled(source: EventSlotFilled) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    builder.writeNumber(source.slotNum);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.source);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserEventSlotFilled(): DictionaryValue<EventSlotFilled> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventSlotFilled(src)).endCell());
        },
        parse: (src) => {
            return loadEventSlotFilled(src.loadRef().beginParse());
        }
    }
}

export type EventPayout = {
    $$type: 'EventPayout';
    tableNum: bigint;
    slotNum: bigint;
    receiver: Address;
    amount: bigint;
}

export function storeEventPayout(src: EventPayout) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(769, 32);
        b_0.storeUint(src.tableNum, 8);
        b_0.storeUint(src.slotNum, 8);
        b_0.storeAddress(src.receiver);
        b_0.storeCoins(src.amount);
    };
}

export function loadEventPayout(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 769) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    const _slotNum = sc_0.loadUintBig(8);
    const _receiver = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    return { $$type: 'EventPayout' as const, tableNum: _tableNum, slotNum: _slotNum, receiver: _receiver, amount: _amount };
}

export function loadTupleEventPayout(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _slotNum = source.readBigNumber();
    const _receiver = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'EventPayout' as const, tableNum: _tableNum, slotNum: _slotNum, receiver: _receiver, amount: _amount };
}

export function loadGetterTupleEventPayout(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _slotNum = source.readBigNumber();
    const _receiver = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'EventPayout' as const, tableNum: _tableNum, slotNum: _slotNum, receiver: _receiver, amount: _amount };
}

export function storeTupleEventPayout(source: EventPayout) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    builder.writeNumber(source.slotNum);
    builder.writeAddress(source.receiver);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserEventPayout(): DictionaryValue<EventPayout> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventPayout(src)).endCell());
        },
        parse: (src) => {
            return loadEventPayout(src.loadRef().beginParse());
        }
    }
}

export type EventFrozen = {
    $$type: 'EventFrozen';
    tableNum: bigint;
    owner: Address;
    frozenAmount: bigint;
}

export function storeEventFrozen(src: EventFrozen) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(770, 32);
        b_0.storeUint(src.tableNum, 8);
        b_0.storeAddress(src.owner);
        b_0.storeCoins(src.frozenAmount);
    };
}

export function loadEventFrozen(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 770) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    const _owner = sc_0.loadAddress();
    const _frozenAmount = sc_0.loadCoins();
    return { $$type: 'EventFrozen' as const, tableNum: _tableNum, owner: _owner, frozenAmount: _frozenAmount };
}

export function loadTupleEventFrozen(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _frozenAmount = source.readBigNumber();
    return { $$type: 'EventFrozen' as const, tableNum: _tableNum, owner: _owner, frozenAmount: _frozenAmount };
}

export function loadGetterTupleEventFrozen(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _frozenAmount = source.readBigNumber();
    return { $$type: 'EventFrozen' as const, tableNum: _tableNum, owner: _owner, frozenAmount: _frozenAmount };
}

export function storeTupleEventFrozen(source: EventFrozen) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    builder.writeAddress(source.owner);
    builder.writeNumber(source.frozenAmount);
    return builder.build();
}

export function dictValueParserEventFrozen(): DictionaryValue<EventFrozen> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventFrozen(src)).endCell());
        },
        parse: (src) => {
            return loadEventFrozen(src.loadRef().beginParse());
        }
    }
}

export type EventUnfrozen = {
    $$type: 'EventUnfrozen';
    tableNum: bigint;
    owner: Address;
    totalAmount: bigint;
    nextTableActivated: bigint;
}

export function storeEventUnfrozen(src: EventUnfrozen) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(771, 32);
        b_0.storeUint(src.tableNum, 8);
        b_0.storeAddress(src.owner);
        b_0.storeCoins(src.totalAmount);
        b_0.storeUint(src.nextTableActivated, 8);
    };
}

export function loadEventUnfrozen(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 771) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    const _owner = sc_0.loadAddress();
    const _totalAmount = sc_0.loadCoins();
    const _nextTableActivated = sc_0.loadUintBig(8);
    return { $$type: 'EventUnfrozen' as const, tableNum: _tableNum, owner: _owner, totalAmount: _totalAmount, nextTableActivated: _nextTableActivated };
}

export function loadTupleEventUnfrozen(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _totalAmount = source.readBigNumber();
    const _nextTableActivated = source.readBigNumber();
    return { $$type: 'EventUnfrozen' as const, tableNum: _tableNum, owner: _owner, totalAmount: _totalAmount, nextTableActivated: _nextTableActivated };
}

export function loadGetterTupleEventUnfrozen(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _totalAmount = source.readBigNumber();
    const _nextTableActivated = source.readBigNumber();
    return { $$type: 'EventUnfrozen' as const, tableNum: _tableNum, owner: _owner, totalAmount: _totalAmount, nextTableActivated: _nextTableActivated };
}

export function storeTupleEventUnfrozen(source: EventUnfrozen) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    builder.writeAddress(source.owner);
    builder.writeNumber(source.totalAmount);
    builder.writeNumber(source.nextTableActivated);
    return builder.build();
}

export function dictValueParserEventUnfrozen(): DictionaryValue<EventUnfrozen> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventUnfrozen(src)).endCell());
        },
        parse: (src) => {
            return loadEventUnfrozen(src.loadRef().beginParse());
        }
    }
}

export type EventSpillover = {
    $$type: 'EventSpillover';
    tableNum: bigint;
    fromUser: Address;
    toUser: Address;
    amount: bigint;
    hops: bigint;
}

export function storeEventSpillover(src: EventSpillover) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(772, 32);
        b_0.storeUint(src.tableNum, 8);
        b_0.storeAddress(src.fromUser);
        b_0.storeAddress(src.toUser);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.hops, 32);
    };
}

export function loadEventSpillover(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 772) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    const _fromUser = sc_0.loadAddress();
    const _toUser = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _hops = sc_0.loadUintBig(32);
    return { $$type: 'EventSpillover' as const, tableNum: _tableNum, fromUser: _fromUser, toUser: _toUser, amount: _amount, hops: _hops };
}

export function loadTupleEventSpillover(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _fromUser = source.readAddress();
    const _toUser = source.readAddress();
    const _amount = source.readBigNumber();
    const _hops = source.readBigNumber();
    return { $$type: 'EventSpillover' as const, tableNum: _tableNum, fromUser: _fromUser, toUser: _toUser, amount: _amount, hops: _hops };
}

export function loadGetterTupleEventSpillover(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _fromUser = source.readAddress();
    const _toUser = source.readAddress();
    const _amount = source.readBigNumber();
    const _hops = source.readBigNumber();
    return { $$type: 'EventSpillover' as const, tableNum: _tableNum, fromUser: _fromUser, toUser: _toUser, amount: _amount, hops: _hops };
}

export function storeTupleEventSpillover(source: EventSpillover) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    builder.writeAddress(source.fromUser);
    builder.writeAddress(source.toUser);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.hops);
    return builder.build();
}

export function dictValueParserEventSpillover(): DictionaryValue<EventSpillover> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventSpillover(src)).endCell());
        },
        parse: (src) => {
            return loadEventSpillover(src.loadRef().beginParse());
        }
    }
}

export type EventReactivation = {
    $$type: 'EventReactivation';
    tableNum: bigint;
    owner: Address;
    cycleCount: bigint;
}

export function storeEventReactivation(src: EventReactivation) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(773, 32);
        b_0.storeUint(src.tableNum, 8);
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.cycleCount, 32);
    };
}

export function loadEventReactivation(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 773) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    const _owner = sc_0.loadAddress();
    const _cycleCount = sc_0.loadUintBig(32);
    return { $$type: 'EventReactivation' as const, tableNum: _tableNum, owner: _owner, cycleCount: _cycleCount };
}

export function loadTupleEventReactivation(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _cycleCount = source.readBigNumber();
    return { $$type: 'EventReactivation' as const, tableNum: _tableNum, owner: _owner, cycleCount: _cycleCount };
}

export function loadGetterTupleEventReactivation(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _cycleCount = source.readBigNumber();
    return { $$type: 'EventReactivation' as const, tableNum: _tableNum, owner: _owner, cycleCount: _cycleCount };
}

export function storeTupleEventReactivation(source: EventReactivation) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    builder.writeAddress(source.owner);
    builder.writeNumber(source.cycleCount);
    return builder.build();
}

export function dictValueParserEventReactivation(): DictionaryValue<EventReactivation> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventReactivation(src)).endCell());
        },
        parse: (src) => {
            return loadEventReactivation(src.loadRef().beginParse());
        }
    }
}

export type EventTableActivated = {
    $$type: 'EventTableActivated';
    tableNum: bigint;
    owner: Address;
    triggeredBy: Address;
}

export function storeEventTableActivated(src: EventTableActivated) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(774, 32);
        b_0.storeUint(src.tableNum, 8);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.triggeredBy);
    };
}

export function loadEventTableActivated(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 774) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    const _owner = sc_0.loadAddress();
    const _triggeredBy = sc_0.loadAddress();
    return { $$type: 'EventTableActivated' as const, tableNum: _tableNum, owner: _owner, triggeredBy: _triggeredBy };
}

export function loadTupleEventTableActivated(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _triggeredBy = source.readAddress();
    return { $$type: 'EventTableActivated' as const, tableNum: _tableNum, owner: _owner, triggeredBy: _triggeredBy };
}

export function loadGetterTupleEventTableActivated(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _owner = source.readAddress();
    const _triggeredBy = source.readAddress();
    return { $$type: 'EventTableActivated' as const, tableNum: _tableNum, owner: _owner, triggeredBy: _triggeredBy };
}

export function storeTupleEventTableActivated(source: EventTableActivated) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.triggeredBy);
    return builder.build();
}

export function dictValueParserEventTableActivated(): DictionaryValue<EventTableActivated> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventTableActivated(src)).endCell());
        },
        parse: (src) => {
            return loadEventTableActivated(src.loadRef().beginParse());
        }
    }
}

export type EventPayoutBounced = {
    $$type: 'EventPayoutBounced';
    tableNum: bigint;
    receiver: Address;
    amount: bigint;
}

export function storeEventPayoutBounced(src: EventPayoutBounced) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(775, 32);
        b_0.storeUint(src.tableNum, 8);
        b_0.storeAddress(src.receiver);
        b_0.storeCoins(src.amount);
    };
}

export function loadEventPayoutBounced(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 775) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    const _receiver = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    return { $$type: 'EventPayoutBounced' as const, tableNum: _tableNum, receiver: _receiver, amount: _amount };
}

export function loadTupleEventPayoutBounced(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _receiver = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'EventPayoutBounced' as const, tableNum: _tableNum, receiver: _receiver, amount: _amount };
}

export function loadGetterTupleEventPayoutBounced(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _receiver = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'EventPayoutBounced' as const, tableNum: _tableNum, receiver: _receiver, amount: _amount };
}

export function storeTupleEventPayoutBounced(source: EventPayoutBounced) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    builder.writeAddress(source.receiver);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserEventPayoutBounced(): DictionaryValue<EventPayoutBounced> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventPayoutBounced(src)).endCell());
        },
        parse: (src) => {
            return loadEventPayoutBounced(src.loadRef().beginParse());
        }
    }
}

export type EventUserRegistered = {
    $$type: 'EventUserRegistered';
    user: Address;
    upline: Address;
}

export function storeEventUserRegistered(src: EventUserRegistered) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(776, 32);
        b_0.storeAddress(src.user);
        b_0.storeAddress(src.upline);
    };
}

export function loadEventUserRegistered(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 776) { throw Error('Invalid prefix'); }
    const _user = sc_0.loadAddress();
    const _upline = sc_0.loadAddress();
    return { $$type: 'EventUserRegistered' as const, user: _user, upline: _upline };
}

export function loadTupleEventUserRegistered(source: TupleReader) {
    const _user = source.readAddress();
    const _upline = source.readAddress();
    return { $$type: 'EventUserRegistered' as const, user: _user, upline: _upline };
}

export function loadGetterTupleEventUserRegistered(source: TupleReader) {
    const _user = source.readAddress();
    const _upline = source.readAddress();
    return { $$type: 'EventUserRegistered' as const, user: _user, upline: _upline };
}

export function storeTupleEventUserRegistered(source: EventUserRegistered) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.user);
    builder.writeAddress(source.upline);
    return builder.build();
}

export function dictValueParserEventUserRegistered(): DictionaryValue<EventUserRegistered> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventUserRegistered(src)).endCell());
        },
        parse: (src) => {
            return loadEventUserRegistered(src.loadRef().beginParse());
        }
    }
}

export type EventSystemFee = {
    $$type: 'EventSystemFee';
    tableNum: bigint;
    amount: bigint;
    feeType: bigint;
}

export function storeEventSystemFee(src: EventSystemFee) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(777, 32);
        b_0.storeUint(src.tableNum, 8);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.feeType, 8);
    };
}

export function loadEventSystemFee(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 777) { throw Error('Invalid prefix'); }
    const _tableNum = sc_0.loadUintBig(8);
    const _amount = sc_0.loadCoins();
    const _feeType = sc_0.loadUintBig(8);
    return { $$type: 'EventSystemFee' as const, tableNum: _tableNum, amount: _amount, feeType: _feeType };
}

export function loadTupleEventSystemFee(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _feeType = source.readBigNumber();
    return { $$type: 'EventSystemFee' as const, tableNum: _tableNum, amount: _amount, feeType: _feeType };
}

export function loadGetterTupleEventSystemFee(source: TupleReader) {
    const _tableNum = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _feeType = source.readBigNumber();
    return { $$type: 'EventSystemFee' as const, tableNum: _tableNum, amount: _amount, feeType: _feeType };
}

export function storeTupleEventSystemFee(source: EventSystemFee) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tableNum);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.feeType);
    return builder.build();
}

export function dictValueParserEventSystemFee(): DictionaryValue<EventSystemFee> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEventSystemFee(src)).endCell());
        },
        parse: (src) => {
            return loadEventSystemFee(src.loadRef().beginParse());
        }
    }
}

export type UserTable = {
    $$type: 'UserTable';
    active: boolean;
    slotsFilled: bigint;
    slot1: Address | null;
    slot2: Address | null;
    slot3: Address | null;
    slot4: Address | null;
    frozen2Amount: bigint;
    cycleCount: bigint;
}

export function storeUserTable(src: UserTable) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.active);
        b_0.storeUint(src.slotsFilled, 8);
        b_0.storeAddress(src.slot1);
        b_0.storeAddress(src.slot2);
        b_0.storeAddress(src.slot3);
        const b_1 = new Builder();
        b_1.storeAddress(src.slot4);
        b_1.storeCoins(src.frozen2Amount);
        b_1.storeUint(src.cycleCount, 32);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadUserTable(slice: Slice) {
    const sc_0 = slice;
    const _active = sc_0.loadBit();
    const _slotsFilled = sc_0.loadUintBig(8);
    const _slot1 = sc_0.loadMaybeAddress();
    const _slot2 = sc_0.loadMaybeAddress();
    const _slot3 = sc_0.loadMaybeAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _slot4 = sc_1.loadMaybeAddress();
    const _frozen2Amount = sc_1.loadCoins();
    const _cycleCount = sc_1.loadUintBig(32);
    return { $$type: 'UserTable' as const, active: _active, slotsFilled: _slotsFilled, slot1: _slot1, slot2: _slot2, slot3: _slot3, slot4: _slot4, frozen2Amount: _frozen2Amount, cycleCount: _cycleCount };
}

export function loadTupleUserTable(source: TupleReader) {
    const _active = source.readBoolean();
    const _slotsFilled = source.readBigNumber();
    const _slot1 = source.readAddressOpt();
    const _slot2 = source.readAddressOpt();
    const _slot3 = source.readAddressOpt();
    const _slot4 = source.readAddressOpt();
    const _frozen2Amount = source.readBigNumber();
    const _cycleCount = source.readBigNumber();
    return { $$type: 'UserTable' as const, active: _active, slotsFilled: _slotsFilled, slot1: _slot1, slot2: _slot2, slot3: _slot3, slot4: _slot4, frozen2Amount: _frozen2Amount, cycleCount: _cycleCount };
}

export function loadGetterTupleUserTable(source: TupleReader) {
    const _active = source.readBoolean();
    const _slotsFilled = source.readBigNumber();
    const _slot1 = source.readAddressOpt();
    const _slot2 = source.readAddressOpt();
    const _slot3 = source.readAddressOpt();
    const _slot4 = source.readAddressOpt();
    const _frozen2Amount = source.readBigNumber();
    const _cycleCount = source.readBigNumber();
    return { $$type: 'UserTable' as const, active: _active, slotsFilled: _slotsFilled, slot1: _slot1, slot2: _slot2, slot3: _slot3, slot4: _slot4, frozen2Amount: _frozen2Amount, cycleCount: _cycleCount };
}

export function storeTupleUserTable(source: UserTable) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.active);
    builder.writeNumber(source.slotsFilled);
    builder.writeAddress(source.slot1);
    builder.writeAddress(source.slot2);
    builder.writeAddress(source.slot3);
    builder.writeAddress(source.slot4);
    builder.writeNumber(source.frozen2Amount);
    builder.writeNumber(source.cycleCount);
    return builder.build();
}

export function dictValueParserUserTable(): DictionaryValue<UserTable> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUserTable(src)).endCell());
        },
        parse: (src) => {
            return loadUserTable(src.loadRef().beginParse());
        }
    }
}

export type UserData = {
    $$type: 'UserData';
    registered: boolean;
    upline: Address;
    isMaster: boolean;
}

export function storeUserData(src: UserData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.registered);
        b_0.storeAddress(src.upline);
        b_0.storeBit(src.isMaster);
    };
}

export function loadUserData(slice: Slice) {
    const sc_0 = slice;
    const _registered = sc_0.loadBit();
    const _upline = sc_0.loadAddress();
    const _isMaster = sc_0.loadBit();
    return { $$type: 'UserData' as const, registered: _registered, upline: _upline, isMaster: _isMaster };
}

export function loadTupleUserData(source: TupleReader) {
    const _registered = source.readBoolean();
    const _upline = source.readAddress();
    const _isMaster = source.readBoolean();
    return { $$type: 'UserData' as const, registered: _registered, upline: _upline, isMaster: _isMaster };
}

export function loadGetterTupleUserData(source: TupleReader) {
    const _registered = source.readBoolean();
    const _upline = source.readAddress();
    const _isMaster = source.readBoolean();
    return { $$type: 'UserData' as const, registered: _registered, upline: _upline, isMaster: _isMaster };
}

export function storeTupleUserData(source: UserData) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.registered);
    builder.writeAddress(source.upline);
    builder.writeBoolean(source.isMaster);
    return builder.build();
}

export function dictValueParserUserData(): DictionaryValue<UserData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUserData(src)).endCell());
        },
        parse: (src) => {
            return loadUserData(src.loadRef().beginParse());
        }
    }
}

export type PendingAction = {
    $$type: 'PendingAction';
    actionType: bigint;
    initiator: Address;
    coSigner: Address;
    newAddress: Address | null;
    amount: bigint;
    newCode: Cell | null;
    expiry: bigint;
}

export function storePendingAction(src: PendingAction) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.actionType, 8);
        b_0.storeAddress(src.initiator);
        b_0.storeAddress(src.coSigner);
        b_0.storeAddress(src.newAddress);
        b_0.storeCoins(src.amount);
        if (src.newCode !== null && src.newCode !== undefined) { b_0.storeBit(true).storeRef(src.newCode); } else { b_0.storeBit(false); }
        b_0.storeUint(src.expiry, 32);
    };
}

export function loadPendingAction(slice: Slice) {
    const sc_0 = slice;
    const _actionType = sc_0.loadUintBig(8);
    const _initiator = sc_0.loadAddress();
    const _coSigner = sc_0.loadAddress();
    const _newAddress = sc_0.loadMaybeAddress();
    const _amount = sc_0.loadCoins();
    const _newCode = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _expiry = sc_0.loadUintBig(32);
    return { $$type: 'PendingAction' as const, actionType: _actionType, initiator: _initiator, coSigner: _coSigner, newAddress: _newAddress, amount: _amount, newCode: _newCode, expiry: _expiry };
}

export function loadTuplePendingAction(source: TupleReader) {
    const _actionType = source.readBigNumber();
    const _initiator = source.readAddress();
    const _coSigner = source.readAddress();
    const _newAddress = source.readAddressOpt();
    const _amount = source.readBigNumber();
    const _newCode = source.readCellOpt();
    const _expiry = source.readBigNumber();
    return { $$type: 'PendingAction' as const, actionType: _actionType, initiator: _initiator, coSigner: _coSigner, newAddress: _newAddress, amount: _amount, newCode: _newCode, expiry: _expiry };
}

export function loadGetterTuplePendingAction(source: TupleReader) {
    const _actionType = source.readBigNumber();
    const _initiator = source.readAddress();
    const _coSigner = source.readAddress();
    const _newAddress = source.readAddressOpt();
    const _amount = source.readBigNumber();
    const _newCode = source.readCellOpt();
    const _expiry = source.readBigNumber();
    return { $$type: 'PendingAction' as const, actionType: _actionType, initiator: _initiator, coSigner: _coSigner, newAddress: _newAddress, amount: _amount, newCode: _newCode, expiry: _expiry };
}

export function storeTuplePendingAction(source: PendingAction) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.actionType);
    builder.writeAddress(source.initiator);
    builder.writeAddress(source.coSigner);
    builder.writeAddress(source.newAddress);
    builder.writeNumber(source.amount);
    builder.writeCell(source.newCode);
    builder.writeNumber(source.expiry);
    return builder.build();
}

export function dictValueParserPendingAction(): DictionaryValue<PendingAction> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePendingAction(src)).endCell());
        },
        parse: (src) => {
            return loadPendingAction(src.loadRef().beginParse());
        }
    }
}

export type MatrixTON$Data = {
    $$type: 'MatrixTON$Data';
    owner: Address;
    masterWallet: Address;
    systemWallet: Address;
    stopped: boolean;
    coSigner: Address;
    processing: boolean;
    users: Dictionary<Address, UserData>;
    userTables1: Dictionary<Address, UserTable>;
    userTables2: Dictionary<Address, UserTable>;
    userTables3: Dictionary<Address, UserTable>;
    userTables4: Dictionary<Address, UserTable>;
    userTables5: Dictionary<Address, UserTable>;
    userTables6: Dictionary<Address, UserTable>;
    userTables7: Dictionary<Address, UserTable>;
    userTables8: Dictionary<Address, UserTable>;
    userTables9: Dictionary<Address, UserTable>;
    userTables10: Dictionary<Address, UserTable>;
    userTables11: Dictionary<Address, UserTable>;
    userTables12: Dictionary<Address, UserTable>;
    pendingActions: Dictionary<bigint, PendingAction>;
    nextActionId: bigint;
    bouncedPayouts: Dictionary<Address, bigint>;
    totalUsers: bigint;
    totalPayouts: bigint;
    totalSystemFees: bigint;
}

export function storeMatrixTON$Data(src: MatrixTON$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.masterWallet);
        b_0.storeAddress(src.systemWallet);
        b_0.storeBit(src.stopped);
        const b_1 = new Builder();
        b_1.storeAddress(src.coSigner);
        b_1.storeBit(src.processing);
        b_1.storeDict(src.users, Dictionary.Keys.Address(), dictValueParserUserData());
        b_1.storeDict(src.userTables1, Dictionary.Keys.Address(), dictValueParserUserTable());
        b_1.storeDict(src.userTables2, Dictionary.Keys.Address(), dictValueParserUserTable());
        const b_2 = new Builder();
        b_2.storeDict(src.userTables3, Dictionary.Keys.Address(), dictValueParserUserTable());
        b_2.storeDict(src.userTables4, Dictionary.Keys.Address(), dictValueParserUserTable());
        b_2.storeDict(src.userTables5, Dictionary.Keys.Address(), dictValueParserUserTable());
        const b_3 = new Builder();
        b_3.storeDict(src.userTables6, Dictionary.Keys.Address(), dictValueParserUserTable());
        b_3.storeDict(src.userTables7, Dictionary.Keys.Address(), dictValueParserUserTable());
        b_3.storeDict(src.userTables8, Dictionary.Keys.Address(), dictValueParserUserTable());
        const b_4 = new Builder();
        b_4.storeDict(src.userTables9, Dictionary.Keys.Address(), dictValueParserUserTable());
        b_4.storeDict(src.userTables10, Dictionary.Keys.Address(), dictValueParserUserTable());
        b_4.storeDict(src.userTables11, Dictionary.Keys.Address(), dictValueParserUserTable());
        const b_5 = new Builder();
        b_5.storeDict(src.userTables12, Dictionary.Keys.Address(), dictValueParserUserTable());
        b_5.storeDict(src.pendingActions, Dictionary.Keys.BigInt(257), dictValueParserPendingAction());
        b_5.storeUint(src.nextActionId, 32);
        b_5.storeDict(src.bouncedPayouts, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_5.storeUint(src.totalUsers, 32);
        b_5.storeCoins(src.totalPayouts);
        b_5.storeCoins(src.totalSystemFees);
        b_4.storeRef(b_5.endCell());
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadMatrixTON$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _masterWallet = sc_0.loadAddress();
    const _systemWallet = sc_0.loadAddress();
    const _stopped = sc_0.loadBit();
    const sc_1 = sc_0.loadRef().beginParse();
    const _coSigner = sc_1.loadAddress();
    const _processing = sc_1.loadBit();
    const _users = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserData(), sc_1);
    const _userTables1 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_1);
    const _userTables2 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_1);
    const sc_2 = sc_1.loadRef().beginParse();
    const _userTables3 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_2);
    const _userTables4 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_2);
    const _userTables5 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_2);
    const sc_3 = sc_2.loadRef().beginParse();
    const _userTables6 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_3);
    const _userTables7 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_3);
    const _userTables8 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_3);
    const sc_4 = sc_3.loadRef().beginParse();
    const _userTables9 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_4);
    const _userTables10 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_4);
    const _userTables11 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_4);
    const sc_5 = sc_4.loadRef().beginParse();
    const _userTables12 = Dictionary.load(Dictionary.Keys.Address(), dictValueParserUserTable(), sc_5);
    const _pendingActions = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserPendingAction(), sc_5);
    const _nextActionId = sc_5.loadUintBig(32);
    const _bouncedPayouts = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_5);
    const _totalUsers = sc_5.loadUintBig(32);
    const _totalPayouts = sc_5.loadCoins();
    const _totalSystemFees = sc_5.loadCoins();
    return { $$type: 'MatrixTON$Data' as const, owner: _owner, masterWallet: _masterWallet, systemWallet: _systemWallet, stopped: _stopped, coSigner: _coSigner, processing: _processing, users: _users, userTables1: _userTables1, userTables2: _userTables2, userTables3: _userTables3, userTables4: _userTables4, userTables5: _userTables5, userTables6: _userTables6, userTables7: _userTables7, userTables8: _userTables8, userTables9: _userTables9, userTables10: _userTables10, userTables11: _userTables11, userTables12: _userTables12, pendingActions: _pendingActions, nextActionId: _nextActionId, bouncedPayouts: _bouncedPayouts, totalUsers: _totalUsers, totalPayouts: _totalPayouts, totalSystemFees: _totalSystemFees };
}

export function loadTupleMatrixTON$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _masterWallet = source.readAddress();
    const _systemWallet = source.readAddress();
    const _stopped = source.readBoolean();
    const _coSigner = source.readAddress();
    const _processing = source.readBoolean();
    const _users = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserData(), source.readCellOpt());
    const _userTables1 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables2 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables3 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables4 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables5 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables6 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables7 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    source = source.readTuple();
    const _userTables8 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables9 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables10 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables11 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables12 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _pendingActions = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPendingAction(), source.readCellOpt());
    const _nextActionId = source.readBigNumber();
    const _bouncedPayouts = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalUsers = source.readBigNumber();
    const _totalPayouts = source.readBigNumber();
    const _totalSystemFees = source.readBigNumber();
    return { $$type: 'MatrixTON$Data' as const, owner: _owner, masterWallet: _masterWallet, systemWallet: _systemWallet, stopped: _stopped, coSigner: _coSigner, processing: _processing, users: _users, userTables1: _userTables1, userTables2: _userTables2, userTables3: _userTables3, userTables4: _userTables4, userTables5: _userTables5, userTables6: _userTables6, userTables7: _userTables7, userTables8: _userTables8, userTables9: _userTables9, userTables10: _userTables10, userTables11: _userTables11, userTables12: _userTables12, pendingActions: _pendingActions, nextActionId: _nextActionId, bouncedPayouts: _bouncedPayouts, totalUsers: _totalUsers, totalPayouts: _totalPayouts, totalSystemFees: _totalSystemFees };
}

export function loadGetterTupleMatrixTON$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _masterWallet = source.readAddress();
    const _systemWallet = source.readAddress();
    const _stopped = source.readBoolean();
    const _coSigner = source.readAddress();
    const _processing = source.readBoolean();
    const _users = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserData(), source.readCellOpt());
    const _userTables1 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables2 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables3 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables4 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables5 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables6 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables7 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables8 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables9 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables10 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables11 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _userTables12 = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserUserTable(), source.readCellOpt());
    const _pendingActions = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPendingAction(), source.readCellOpt());
    const _nextActionId = source.readBigNumber();
    const _bouncedPayouts = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _totalUsers = source.readBigNumber();
    const _totalPayouts = source.readBigNumber();
    const _totalSystemFees = source.readBigNumber();
    return { $$type: 'MatrixTON$Data' as const, owner: _owner, masterWallet: _masterWallet, systemWallet: _systemWallet, stopped: _stopped, coSigner: _coSigner, processing: _processing, users: _users, userTables1: _userTables1, userTables2: _userTables2, userTables3: _userTables3, userTables4: _userTables4, userTables5: _userTables5, userTables6: _userTables6, userTables7: _userTables7, userTables8: _userTables8, userTables9: _userTables9, userTables10: _userTables10, userTables11: _userTables11, userTables12: _userTables12, pendingActions: _pendingActions, nextActionId: _nextActionId, bouncedPayouts: _bouncedPayouts, totalUsers: _totalUsers, totalPayouts: _totalPayouts, totalSystemFees: _totalSystemFees };
}

export function storeTupleMatrixTON$Data(source: MatrixTON$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.masterWallet);
    builder.writeAddress(source.systemWallet);
    builder.writeBoolean(source.stopped);
    builder.writeAddress(source.coSigner);
    builder.writeBoolean(source.processing);
    builder.writeCell(source.users.size > 0 ? beginCell().storeDictDirect(source.users, Dictionary.Keys.Address(), dictValueParserUserData()).endCell() : null);
    builder.writeCell(source.userTables1.size > 0 ? beginCell().storeDictDirect(source.userTables1, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables2.size > 0 ? beginCell().storeDictDirect(source.userTables2, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables3.size > 0 ? beginCell().storeDictDirect(source.userTables3, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables4.size > 0 ? beginCell().storeDictDirect(source.userTables4, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables5.size > 0 ? beginCell().storeDictDirect(source.userTables5, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables6.size > 0 ? beginCell().storeDictDirect(source.userTables6, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables7.size > 0 ? beginCell().storeDictDirect(source.userTables7, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables8.size > 0 ? beginCell().storeDictDirect(source.userTables8, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables9.size > 0 ? beginCell().storeDictDirect(source.userTables9, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables10.size > 0 ? beginCell().storeDictDirect(source.userTables10, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables11.size > 0 ? beginCell().storeDictDirect(source.userTables11, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.userTables12.size > 0 ? beginCell().storeDictDirect(source.userTables12, Dictionary.Keys.Address(), dictValueParserUserTable()).endCell() : null);
    builder.writeCell(source.pendingActions.size > 0 ? beginCell().storeDictDirect(source.pendingActions, Dictionary.Keys.BigInt(257), dictValueParserPendingAction()).endCell() : null);
    builder.writeNumber(source.nextActionId);
    builder.writeCell(source.bouncedPayouts.size > 0 ? beginCell().storeDictDirect(source.bouncedPayouts, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.totalUsers);
    builder.writeNumber(source.totalPayouts);
    builder.writeNumber(source.totalSystemFees);
    return builder.build();
}

export function dictValueParserMatrixTON$Data(): DictionaryValue<MatrixTON$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMatrixTON$Data(src)).endCell());
        },
        parse: (src) => {
            return loadMatrixTON$Data(src.loadRef().beginParse());
        }
    }
}

 type MatrixTON_init_args = {
    $$type: 'MatrixTON_init_args';
    masterWallet: Address;
    systemWallet: Address;
    coSigner: Address;
}

function initMatrixTON_init_args(src: MatrixTON_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.masterWallet);
        b_0.storeAddress(src.systemWallet);
        b_0.storeAddress(src.coSigner);
    };
}

async function MatrixTON_init(masterWallet: Address, systemWallet: Address, coSigner: Address) {
    const __code = Cell.fromHex('b5ee9c724102d301003f4700022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d9014c02016202030105a000c1650201200426020120050c02012006070395b5a1bda89a1a400031d6df481f481f480aa4007a2b0e0e0dadadadadadadadadadadadadadae0daa8e223f0842230222e222c22282226222422222220abc1b679c61bb678ae20be1ed9230a14d09020162080a0394a97bed44d0d200018eb6fa40fa40fa40552003d15870706d6d6d6d6d6d6d6d6d6d6d6d6d6d706d547111f8421118111711161114111311121111111055e0db3ce30ddb3c57105f0f6c91a14d09000456150394a8b0ed44d0d200018eb6fa40fa40fa40552003d15870706d6d6d6d6d6d6d6d6d6d6d6d6d6d706d547111f8421118111711161114111311121111111055e0db3ce30ddb3c57105f0f6c91a14d0b000456170201200d230201200e1d0201200f1b0201581018020120111603f7a023b513434800063adbe903e903e90154800f4561c1c1b5b5b5b5b5b5b5b5b5b5b5b5b5b5c1b551c447e1084460445c44584450444c44484444444157836cf38c34446044644460445c4460445c4458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403ea14d120114550edb3c57105f0f6c911301f456195619561956195619561956195619561956195619561956195619561956195619561956195619561956195619561956191119113211191118113111181117113011171116112f11161115112e11151114112d11141113112c11131112112b11121111112a11111110112911100f11280f0e11270e0d11260d1402fc0c11250c0b11240b0a11230a09112209081121080711200706111f0605111e0504111d0403111c0302111b0201111a011132db3c57105f0f6c911118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab5b150140109a1089107810671056104510344130db3c82101dcd6500a082101dcd6500a0600393a077b513434800063adbe903e903e90154800f4561c1c1b5b5b5b5b5b5b5b5b5b5b5b5b5b5c1b551c447e1084460445c44584450444c44484444444157836cf38c376cf15c417c3db246a14d170004561803f7a765da89a1a400031d6df481f481f480aa4007a2b0e0e0dadadadadadadadadadadadadadae0daa8e223f0842230222e222c22282226222422222220abc1b679c61a223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201fa14d190140550edb3c57105f0f6c91206e92306d99206ef2d0806f276f07e2206e92306dde1a0068810101270259f40d6fa192306ddf206e92306d8e1ed0d307fa40fa40d72c01916d93fa4001e201fa00f404d31f55606c176f07e20395acabf6a268690000c75b7d207d207d202a9001e8ac383836b6b6b6b6b6b6b6b6b6b6b6b6b6b836aa3888fc21088c088b888b088a08898889088888882af06d9e7186ed9e2b882f87b648c0a14d1c0004561602039cd41e2103f7a476a268690000c75b7d207d207d202a9001e8ac383836b6b6b6b6b6b6b6b6b6b6b6b6b6b836aa3888fc21088c088b888b088a08898889088888882af06d9e7186888c088c888c088b888c088b888b088b888b088a888b088a888a088a888a0889888a088988890889888908888889088888880888888807888807c0a14d1f0140550edb3c57105f0f6c91206e92306d99206ef2d0806f236f03e2206e92306dde20004681010b56140259f40b6fa192306ddf206e92306d9dd0d200fa40d20055206c136f03e20393a676a268690000c75b7d207d207d202a9001e8ac383836b6b6b6b6b6b6b6b6b6b6b6b6b6b836aa3888fc21088c088b888b088a08898889088888882af06d9e7186ed9e2b882f87b648c0a14d220004561403f9b5911da89a1a400031d6df481f481f480aa4007a2b0e0e0dadadadadadadadadadadadadadae0daa8e223f0842230222e222c22282226222422222220abc1b679c61a223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201f0a14d240114550edb3c57105f0f6c9125004681010b25028101014133f40a6fa19401d70030925b6de2206eb395206ef2d080e0307002012027430201202836020158292f0201202a2d03f8a842ed44d0d200018eb6fa40fa40fa40552003d15870706d6d6d6d6d6d6d6d6d6d6d6d6d6d706d547111f8421118111711161114111311121111111055e0db3ce30d1118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100fa14d2b0114550edb3c57105f0f6c912c0104db3c5b0394aa76ed44d0d200018eb6fa40fa40fa40552003d15870706d6d6d6d6d6d6d6d6d6d6d6d6d6d706d547111f8421118111711161114111311121111111055e0db3ce30ddb3c57105f0f6c91a14d2e00926d810101715351216e955b59f45a3098c801cf004133f442e2810101725341216e955b59f45a3098c801cf004133f442e2810101735331216e955b59f45a3098c801cf004133f442e2020120303303f8a932ed44d0d200018eb6fa40fa40fa40552003d15870706d6d6d6d6d6d6d6d6d6d6d6d6d6d706d547111f8421118111711161114111311121111111055e0db3ce30d1118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100fa14d310114550edb3c57105f0f6c9132004a81010b56140259f40b6fa192306ddf206e92306d9dd0d200fa40d20055206c136f03e26eb303f8a950ed44d0d200018eb6fa40fa40fa40552003d15870706d6d6d6d6d6d6d6d6d6d6d6d6d6d706d547111f8421118111711161114111311121111111055e0db3ce30d1118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110fa14d34014c0e11100e10df551cdb3c57105f0f6c91206e92306d99206ef2d0806f286f08e2206e92306dde350104db3ca40201203741020120383b03f9ae6ef6a268690000c75b7d207d207d202a9001e8ac383836b6b6b6b6b6b6b6b6b6b6b6b6b6b836aa3888fc21088c088b888b088a08898889088888882af06d9e7186888c088d088c088b888c888b888b088c088b088a888b888a888a088b088a0889888a88898889088a088908888889888888880889088807888887c0a14d3901200e11100e10df551cdb3c57105f0f6c913a0104db3c7e03f9ad2d76a268690000c75b7d207d207d202a9001e8ac383836b6b6b6b6b6b6b6b6b6b6b6b6b6b836aa3888fc21088c088b888b088a08898889088888882af06d9e7186888c088c888c088b888c088b888b088b888b088a888b088a888a088a888a0889888a088988890889888908888889088888880888888807888807c0a14d3c0114550edb3c57105f0f6c913d01146d719320c10d8ae830313e02fa1118111b11181117111a11171116111911161115111b11151114111a11141113111911131112111b11121111111a11111110111911100f111b0f0e111a0e0d11190d0c111b0c0b111a0b0a11190a09111b0908111a080711190706111b0605111a050411190403111b0302111a0201111901111b561a561cdb3c206eb3a43f01fc8e3c206ef2d0806f286c5170039682080f424033de01812710a812a001a08101012003111c0312561e59216e955b59f45a3098c801cf004133f442e211199130e2111ba41118111b11181117111a11171116111911161115111811151114111711141113111611131112111511121111111411111110111311100f11120f40003c0e11110e0d11100d10cf10be10ad109c108b107a106910581047103645400395b0e13b513434800063adbe903e903e90154800f4561c1c1b5b5b5b5b5b5b5b5b5b5b5b5b5b5c1b551c447e1084460445c44584450444c44484444444157836cf38c376cf15c417c3db2460a14d420008f8276f10020120444903f9b7ecdda89a1a400031d6df481f481f480aa4007a2b0e0e0dadadadadadadadadadadadadadae0daa8e223f0842230222e222c22282226222422222220abc1b679c61a223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201f0a14d450114550edb3c57105f0f6c914601f456195619561956195619561956195619561956195619561956195619561956195619561956195619561956195619561956191119113211191118113111181117113011171116112f11161115112e11151114112d11141113112c11131112112b11121111112a11111110112911100f11280f0e11270e0d11260d4702fc0c11250c0b11240b0a11230a09112209081121080711200706111f0605111e0504111d0403111c0302111b0201111a011132db3c57105f0f6c911118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab5b480132109a1089107810671056104510344130db3c82101dcd6500a16203f5dbda89a1a400031d6df481f481f480aa4007a2b0e0e0dadadadadadadadadadadadadadae0daa8e223f0842230222e222c22282226222422222220abc1b679c61a223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201fa14d4a0114550edb3c57105f0f6c914b006681010b56140259f40b6fa192306ddf206e92306d9dd0d200fa40d20055206c136f03e2206eb399206ef2d0806f233031e0306d04caeda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018eb6fa40fa40fa40552003d15870706d6d6d6d6d6d6d6d6d6d6d6d6d6d706d547111f8421118111711161114111311121111111055e0db3ce30d111ae3025618d749c21fa14d4f5001f4fa40fa40fa40d200d401d0fa40d200f404f404f404d430d0f404f404f404d430d0f404f404f404d430d0f404f404f404d430d0f404f404d31ff404d31ffa00fa003011151119111511151118111511151117111511151116111557191117111811171116111711161115111611151114111511141113111411134e00301112111311121111111211111110111111100f11100f550e017057181116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3cd103b0e3001118f9012082f040391f4eaad79adb418bdfd49edad3b17b5e392ce4fafbbf82f21f2055ee0f7dbae30282f0e2766386272bddd6151b177e581ac9f613131b45e13cdc7af80e4091130d73e8bae3025f0f5f0af2c08251c9cc043a1118d31f218307bae30221810101bae30221810206bae30221810205ba5258929302ee31fa40301117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411194130db3c8163cb1114b301111401f2f47ff84281526d561481010b2359f40b6fa192306ddfce5301e4206e92306d9dd0d200fa40d20055206c136f03e26ef2f4561381010b561c59f40b6fa192306ddf206e92306d9dd0d200fa40d20055206c136f03e26e96571a5617111ade821283baec008200b637f8416f24135f0358bef2f481010b7f561c70c855205023ca00ceca00c9021115025615015404f4206e953059f45930944133f413e203a411181119111811171119111711161119111611151119111511141119111401111301031112030311110303111003103f103e103d103c103b103a103910381037103610351034591119561971561bdb3c8212540be400db3c82101dcd650001a07120db3c8212540be400a3608c5503fadb3c1118111911181117111911171116111911161115111911151114111911141113111911131112111911121111111911111110111911100f11190f0e11190e0d11190d0c11190c0b11190b0a11190a0911190911190807065540561b71db3c71561c22561d70c855408103045006cb1f14cb0712cece01fa02cb1fc9627e5601fec88258c000000000000000000000000101cb67ccc970fb00561b01111dc8598103085003cb1fcecec9c88258c000000000000000000000000101cb67ccc970fb001118111b11181117111a11171116111911161115111811151114111711141113111611131112111511121111111411111110111311100f11120f0e11110e57024e0d11100d10cf10be10ad109c108b107a1069105810471036451350427102db3c705714db3cdb3165d102ee31d307301117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411194130db3c8163cb1114b301111401f2f47ff842812583561481010b2359f40b6fa192306ddfce5901fe206e92306d9dd0d200fa40d20055206c136f03e26eb3f2f48200d2d1561bc20194561bc10d9170e2f2f4561aa51119111a11191118111a11181117111a11171116111a11161115111a11150211140202111302021112020211110202111002102f102e102d102c102b102a102910281027102610251024102301111a01561a5a04fa01db3c8200eed3216eb39a01206ef2d0806f285f07923170e2f2f45619561bdb3c812612216e92317f9b01206ef2d0806f285f07b3e2f2f4561adb3c8200b637f8416f24135f032282101dcd6500a0821011e1a300a0bef2f4111811191118111711191117111611191116111511191115111411191114111311191113a4a45b5e02f420c00197308212540be400e020c0029830821804a817c800e020c0039830821809502f9000e020c0049830821812a05f2000e020c005983082182540be4000e020c006983082184a817c8000e020c007983082189502f90000e020c008983082192a05f20000e020c0099830821a540be40000e020c00ae302205c5d001230822004a817c800000034c00b9930822009502f900000e0c00c98822012a05f200000e07002f61112111911121111111911111110111911100f11190f0e11190e0d11190d0c11190c0b11190b0a11190a0911190911190807065540561a561c561cdb3c5618561856185618561856185618561856185618561856185618561856185618561856185618561856185618561856185618111711311117111611301116a35f02fc1115112f11151114112e11141113112d11131112112c11121111112b11111110112a11100f11290f0e11280e0d11270d0c11260c0b11250b0a11240a0911230908112208071121070611200605111f0504111e0403111d0302111c0201111b01111a82101dcd6500111a5633db3c57105f0f6c9112a001111901011118016061000ca70a8064a90403fa01111701011116010111150101111401011113010111120101111101011110011f1e1d1c1b1a1918171615144330561c71db3c1118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c1118111911181117111911178c6263000ca75a8064a90402e21116111911161115111911151114111911141113111911131112111911121111111911111110111911100f11190f0e11190e0d11190d0c11190c0b11190b0a11190a0911190911190807065540561a561cdb3c561c561c22561d70c855408103045006cb1f14cb0712cece01fa02cb1fc97e6402dec88258c000000000000000000000000101cb67ccc970fb001119111c11191118111b11181117111a11171116111911161115111811151114111711141113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d10cf10be552adb3c705714db3cdb3165d101f6eda2edfb561681010b2559f40b6fa192306ddf206e92306d9dd0d200fa40d20055206c136f03e28200efd8216eb3f2f4206ef2d0806f236c211118111d11181117111c11171116111b11161115111a11151114111911141113111d11131112111c11121111111b11111110111a11100f11190f0e111d0e0d111c0d6602f80c111b0c0b111a0b0a11190a09111d0908111c0807111b0706111a060511190504111d0403111c0302111b0201111a011119561d561ddb3c811b72216eb3f2f4206ef2d0806f2881417b28f2f48200bb5027c104f2f426a4112011211120111f1121111f111e1121111e111d1121111d111c1121111c111b1121111ba46703ec111a1121111a1119112111191118112111181117112111171116112111161115112111151114112111141113112111131112112111121111112111111110112111100f11210f0e11210e0d11210d0c11210c0b11210b0a11210a091121091121080706554056215625db3c3656201122e3025620c00168696e004421c0019231368e1921c0029231358e1021c0039231349801c00491339130e2e2e2e204e4562282101dcd6500a120c200e3005621c0048eb6112206db3c5625562722c855208103055004cb1f12cb07cecb1fc9c88258c000000000000000000000000101cb67ccc970fb00061122de562608562650780611240615041124041302112402db3c561d02561a0256200201111f01111ec86a74b26c01fe8bd5041594f55543a4d415354455281119112111191118112011181117111f11171116111e11161115111d11151114111c11141113111b11131112111a11121111112111111110112011100f111f0f0e111e0e0d111d0d0c111c0c0b111b0b0a111a0a091121090811200807111f0706111e0605111d0504111c0403111b036b02f002111a0201112101562701562201db3c015620a00182101dcd6500562672db3c1118112011181117111f11171116111e11161115111d11151114111c11141113111b11131112111a11121111111911111110111811100f11170f0e11160e0d11150d0c11140c0b11130b0a11120a09111109081110085577c38c01fa55408103005006cb1f14cb0712cb07cece01fa02c9c88258c000000000000000000000000101cb67ccc970fb0003111b030211170201111c011118c855308103015005cb1f13cb07cb07ce01fa02c9c88258c000000000000000000000000101cb67ccc970fb001112111811121111111711111110111611100f11150f6d00500e11140e0d11130d0c11120c0b11110b0a11100a109f108e107d106c105b104a103948165033070403f68ec1562282101dcd6500a120c200e30071562602562801c855308103015005cb1f13cb07cb07ce01fa02c9c88258c000000000000000000000000101cb67ccc970fb00e30e111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811176f719001fe8b95041594f55543a533181119112111191118112011181117111f11171116111e11161115111d11151114111c11141113111b11131112111a11121111112111111110112011100f111f0f0e111e0e0d111d0d0c111c0c0b111b0b0a111a0a091121090811200807111f0706111e0605111d0504111c0403111b0302111a027002e801112101562701562201db3c015620a00182101dcd6500562672db3c1118112011181117111f11171116111e11161115111d11151114111c11141113111b11131112111a11121111111911111110111811100f11170f0e11160e0d11150d0c11140c0b11130b0a11120a09111109081110085577c38c04f45620c0028f4e5620c0038ec65620c004e30203111f0302111e0201111d01111c06111b0605111a05041119040311180302111702011116011115061114060511130504111204031111030211100250fe5566e30de30d1118111f11181117111e11171116111d11161115111c11151114111b11141113111a11137278878f01fc1067061121065504111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a1089081121087302fcdb3c5624562622c855208103055004cb1f12cb07cecb1fc9c88258c000000000000000000000000101cb67ccc970fb005624a45625c00c9330800cde112011211120111f1121111f111e1121111e111d1121111d111c1121111c111b1121111b111a1121111a1119112111191118112111181117112111171116112111167475002a6c717f706d6d6d6d2407a41067105610451034413003fe1115112111151114112111141113112111131112112111121111112111111110112111100f11210f0e11210e0d11210d0c11210c0b11210b0a11210a0911210908112108562608562608071123075065041123040211235003db3c561e561adb3c561a562022561f70c855408103045006cb1f14cb0712cece01fa02cb1fc9b27e7601e6c88258c000000000000000000000000101cb67ccc970fb001119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e561f561df06004111c040311190302111d0201111b01111ac87700e255408103005006cb1f14cb0712cb07cece01fa02c9c88258c000000000000000000000000101cb67ccc970fb001113111811131112111711121111111611111110111511100f11140f0e11130e0d11120d0c11110c0b11100b10af109e108d107c106b105a10491038471503444406db3103fc1118111f11181117111e11171116111d11161115111c11151114111b11141113111a11131112111911121111111f11111110111e11100f111d0f0e111c0e0d111b0d0c111a0c0b11190b0a111f0a09111e0908111d0807111c0706111b0605111a050411190403111f0302111e0201111d01111c56255625db3ce303562288798502f8111c5622a0705625a420c10de300562656285342c855308103035005cb1f13cb07ce01fa02cb07c9c88258c000000000000000000000000101cb67ccc970fb00111a1120111a1119111f11191118111e11181117111d11171116111c11161115111b11151114111a11141113111911131112111811121111111711117a7c02fc1118111a11181117111911171116111a11161115111911151114111a11141113111911131112111a11121111111911111110111a11100f11190f0e111a0e0d11190d0c111a0c0b11190b0a111a0a0911190908111a080711190706111a060511190504111a040311190302111a0201111901111e5627561f5629db3c111ea37b00ac1118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443003ea1110111611100f11150f0e11140e0d11130d0c11120c0b11110b0a11100a109f108e107d106c105b104a10391068562708562708061125060411230441331125db3c561bc10d945719571ae30d04111c040311180302111d0201111b01111ac855408103005006cb1f14cb0712cb07cece01fa02c9b27d8402f8561f561cdb3c561c562122561d70c855408103045006cb1f14cb0712cece01fa02cb1fc9c88258c000000000000000000000000101cb67ccc970fb001119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f7e83011eeda2edfb709320c1648ae85f0356177f01fe81010b5616401459f40b6fa192306ddf206e92306d9dd0d200fa40d20055206c136f03e2206e965f035617db31e0206ef2d0806f233031561581010b2259f40b6fa192306ddf206e92306d9dd0d200fa40d20055206c136f03e2206e965f045617db31e0206ef2d0806f236c21946c21db31e01118111b11181117111a11178003fc1116111911161115111b11151114111a11141113111911131112111b11121111111a11111110111911100f111b0f0e111a0e0d11190d0c111b0c0b111a0b0a11190a09111b0908111a080711190706111b0605111a050411190403111b0302111a0201111901111b561b561adb3c206eb39130e30d111aa41118111b1118a4818200a4206ef2d0806f285f060192c104923070e28e3e571957191116111911161115111811151114111711141113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d552cdb31e000a81117111a11171116111911161115111811151114111711141113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d10cf10be10ad109c108b107a10691058104710364540102300640e11100e551d01111c01562001f06001111901011118011117011116011115011114011113011112011111011110010f55c100aac88258c000000000000000000000000101cb67ccc970fb001111111811111110111711100f11160f0e11150e0d11140d0c11130c0b11120b0a11110a09111009108f107e106d105c104b103a49174066080304db31017e82101dcd6500a120c200e30073562602562801c855308103015005cb1f13cb07cb07ce01fa02c9c88258c000000000000000000000000101cb67ccc970fb008601fe8b95041594f55543a533381119111a11191118111a11181117111a11171116111a11161115111a11151114111a11141113111a11131112111a11121111111a11111110111a11100f111a0f0e111a0e0d111a0d0c111a0c0b111a0b0a111a0a09111a0908111a0807111a0706111a0605111a0504111a0403111a0302111a028b03f81118111f11181117111e11171116111d11161115111c11151114111b11141113111a11131112111911121111111f11111110111e11100f111d0f0e111c0e0d111b0d0c111a0c0b11190b0a111f0a09111e0908111d0807111c0706111b0605111a050411190403111f0302111e0201111d01111c56255625db3ce30f88898e013620c20b925b7fe0a4db3c206eb399206ef2d0806f285f07923070e2a40182562282101dcd6500a120c200e30072562602562801c855308103015005cb1f13cb07cb07ce01fa02c9c88258c000000000000000000000000101cb67ccc970fb008a01fe8b95041594f55543a533281119111a11191118111a11181117111a11171116111a11161115111a11151114111a11141113111a11131112111a11121111111a11111110111a11100f111a0f0e111a0e0d111a0d0c111a0c0b111a0b0a111a0a09111a0908111a0807111a0706111a0605111a0504111a0403111a0302111a028b02b001111a01562701561b01db3c015619a00182101dcd6500562672db3c1118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550ec38c01ee22c101925f03e0737088561c5136413310246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb005132a05023c855208103095004cb1f12cb0701fa02cb07c9c88258c000000000000000000000000101cb67ccc970fb008d0016000000005359533a464545006c571c5621562456265624c855208103025004cb1f12cb07ce01fa02c9c88258c000000000000000000000000101cb67ccc970fb00111c00681112111911121111111811111110111711100f11160f0e11150e0d11140d0c11130c0b11120b0a11110a09111009108f107e556602e41116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a1089107856250856250807061123060511230504112304031123030211230201112301db3c04111c040311190302111d0201111b01111ac8b29100de55408103005006cb1f14cb0712cb07cece01fa02c9c88258c000000000000000000000000101cb67ccc970fb001113111811131112111711121111111611111110111511100f11140f0e11130e0d11120d0c11110c0b11100b10af109e108d107c106b105a1049103847150344440602f831fa40301117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411194130db3c5714111711181117111611171116111511161115111411151114111211131112111111121111cd9403fe8f7c31d200301117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411194130db3c5715111711181117111611171116111511161115111311141113111211131112111111121111e0cd949501201110111111100f11100f550edb3cdb31d10432218308bae30221810202bae30221810203bae30221810204ba9697989a02f831fa40fa403001111901111adb3c8200eebb561b5616c705f2f424a481010171f842706df823810e10a0104610350411210403112003c855605067cb0714ce12ce01206e9430cf84809201cee201fa02f400cb1fc9103602111a0215206e953059f45a30944133f415e2111611181116111511171115111411161114cd9902f831fa40fa403001111901111adb3c8200eebb561b5616c705f2f424a481010172f842706df823810e10a0104610350411210403112003c855605067cb0714ce12ce01206e9430cf84809201cee201fa02f400cb1fc9103602111a0215206e953059f45a30944133f415e2111611181116111511171115111411161114cd9902fa31d4fa403001111901111adb3c8200eebb561b5616c705f2f424a481010173f8426d70f823810e10a01046103504112104413001112001c855605067cb0714ce12ce01206e9430cf84809201cee201fa02f400cb1fc9103602111a0215206e953059f45a30944133f415e2111611181116111511171115111411161114cd9901781113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104650554313db3cdb31d103eee30221810201bae302018210946a98b6ba8ee1d33f30c8018210aff90f5758cb1fcb3fc91117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354430e011189b9ec802fc31fa00fa40fa40301118111911181117111911171116111911161115111911151114111911141113111911131112111911121111111911111110111911100f11190f0e11190e0d11190d0c11190c0b11190b0a11190a091119090811190807111907061119060511190504111904031119030211190201111a01111bdb3ccd9c01f88200eebb561c5616c705f2f4f8276f1082103b9aca00a18142a6561bc20094561b58bb923170e2f2f424a481010174f8426df823810e10a010361025041121040311200302111f02c855605067cb0714ce12ce01206e9430cf84809201cee201fa02f400cb1fc9103502111b0214206e953059f45a30944133f415e29d01941115111811151114111711141113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d10cf10be10ad109c108b107a10691058104710364315db3cdb31d103fa31d31f308146d5f8425615c705f2f4248101012259f40d6fa192306ddf206e92306d8e1ed0d307fa40fa40d72c01916d93fa4001e201fa00f404d31f55606c176f07e28200bf46216eb3f2f4206ef2d0806f27313333817c6ef8235003bb12f2f422c001e30f0111190105810101f45a301117111811171116111711169fc0c701fc6c21561281010b561959f40b6fa192306ddf206e92306d9dd0d200fa40d20055206c136f03e2206eb38e31206ef2d0806f233081010b5970c855205023ca00ceca00c9031114031201111901206e953059f45930944133f413e2111193305717e21116206ef2d08011171118111511161115111411151114111311141113a001381112111311121111111211111110111111100f11100f550e1119db3ca1016281010b7f56197fc855205023ca00ceca00c902111402561901206e953059f45930944133f413e2719320c10d8ae8301112a202fe11181119111856191118111711161115111402111302021112020211110202111002102f102e102d102c102b102a1029102810271026102510244300561a5110111cdb3c1119a41118111911181117111811171116111711161115111611151114111511141113111411131111111211111110111111100f11100f10ef10dea3bf02f41117111b11171116111a11161115111911151114111811141113111b11131112111a11121111111911111110111811100f111b0f0e111a0e0d11190d0c11180c0b111b0b0a111a0a091119090811180807111b0706111a06051119050411180403111b0302111a0201111901111870111c561b561bdb3c206eb3a4b004ee20c0018e5f3081010b56130259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e2e020c002e30220c003e30220c004e30220c005a5a6a7a800be3081010b56120259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e200be3081010b56110259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e200be3081010b56100259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e204e68e5e3081010b2f0259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e2e020c006e30220c007e30220c008e30220c009a9aaabac00bc3081010b2e0259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e200bc3081010b2d0259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e200bc3081010b2c0259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e203e28e5e3081010b2b0259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e2e020c00ae30220c00be302c00ce302306dadaeaf00bc3081010b2a0259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e200bc3081010b290259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e200ba81010b280259f40b6fa192306ddf206e92306d8e47d0d200d307d72c01916d93fa4001e201d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0d72c01916d93fa4001e201fa00d31f30103810371036103510346c186f08e201f49f571d111c206ef2d0806f286c71111c9130e27f706d6d6d2310561045103410236d40131123111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a1119111811191118111711181117111611171116111511161115111411151114111311141113111211131112b102f81111111211111110111111100f11100f10ef10de10cd10bc10ab109a1089081123085622085622085551db3c0211190201111a01111bc855208103065004cb1f12cb07cecec9c88258c000000000000000000000000101cb67ccc970fb00111511181115111411171114111311161113111211151112111111141111b2be04f628c0018e6581010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc902111d0252b0206e953059f45930944133f413e2111bde28c002e30028c003e30028c004e30028b3b4b5b600ca81010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc902111c0252b0206e953059f45930944133f413e2111a00ca81010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc902111b0252b0206e953059f45930944133f413e2111900ca81010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc902111a0252b0206e953059f45930944133f413e2111804f8c0058e6581010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc90211190252b0206e953059f45930944133f413e21117de28c006e30028c007e30028c008e30028c009b7b8b9ba00ca81010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc90211180252b0206e953059f45930944133f413e2111600ca81010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc90211170252b0206e953059f45930944133f413e2111500ca81010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc90211160252b0206e953059f45930944133f413e2111403f48e6581010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc90211150252b0206e953059f45930944133f413e21113de28c00ae30028c00be30008c00c925f09e30dbbbcbd00ca81010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc90211140252b0206e953059f45930944133f413e2111200ca81010b5478765478765387c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc90211130252b0206e953059f45930944133f413e2111100b481010b08c855705078ca0015cb075003206e9430cf84809201cee201206e9430cf84809201cee201206e9430cf84809201cee2c858206e9430cf84809201cee258fa0212cb1fcdc9103912206e953059f45930944133f413e206002e1110111311100f11120f0e11110e0d11100d10cf552b12002c10cd10bc10ab109a108910781067105610451034413003fc22c0029a57185b1115206ef2d0808f6722c0038ed85f035004810101f45a301116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104644554313db3cdb31e002c004915be30d1115e2111511191115d1c1c601fcf8276f1082103b9aca00a12181453302bbf2f401206ef2d0808b9454d455247454e43598111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a1089107810671056c2017a104503111c0312db3c11190111180101111701011116010111150101111401011113010111120101111101011110011f1e1d1c1b1a1918171615144330c3018621c101925f03e07101db3c7f44306d036d4313c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00c40142c87001cb1f6f00016f8c6d6f8c01db3c6f2201c993216eb396016f2259ccc9e831c500b620d74a21d7499720c20022c200b18e48036f22807f22cf31ab02a105ab025155b60820c2009a20aa0215d71803ce4014de596f025341a1c20099c8016f025044a1aa028e123133c20099d430d020d74a21d749927020e2e2e85f03005c111711181117111611171114111511141113111411131112111311121111111211111110111111100f11100f550e01841115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106705065503db3cdb31d1014ef84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00db3cdb31d104c8301116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3cdb3c5715708801111601f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00cdcacbd000108200d0305616f2f4001600000000526573756d656404c61116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3cdb3c57157f8801111601f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00cdcecfd00012f8425619c705f2e084000c5615b3f2e08500160000000053746f707065640104db3cd10136c87f01ca00111911181117111611151114111311121111111055e0d200ca011118011119ce01111601ce01111401ce01111201ca001110c8ce1fca001df4001bf40019f40007c8f40016f40014f40002c8f400f40012f40002c8f40014f40014f40004c8f40015f40016cb1f16f40016cb1f5006fa025006fa0213cdcdcdcdcdc9ed54f41d2910');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initMatrixTON_init_args({ $$type: 'MatrixTON_init_args', masterWallet, systemWallet, coSigner })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const MatrixTON_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    7026: { message: "Table not found" },
    9603: { message: "Not registered" },
    9746: { message: "Table already active" },
    16763: { message: "Table not active" },
    17062: { message: "Invalid amount" },
    17715: { message: "Insufficient balance now" },
    18133: { message: "Only co-signer can confirm" },
    21101: { message: "Already registered" },
    25547: { message: "Reentrant call detected" },
    31854: { message: "Action expired" },
    46647: { message: "Insufficient payment" },
    47952: { message: "Table full" },
    48966: { message: "Action not found" },
    53296: { message: "Contract not stopped" },
    53969: { message: "Invalid table number" },
    61115: { message: "Invalid co-signer" },
    61139: { message: "Previous table not active" },
    61400: { message: "Owner not registered" },
} as const

export const MatrixTON_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Table not found": 7026,
    "Not registered": 9603,
    "Table already active": 9746,
    "Table not active": 16763,
    "Invalid amount": 17062,
    "Insufficient balance now": 17715,
    "Only co-signer can confirm": 18133,
    "Already registered": 21101,
    "Reentrant call detected": 25547,
    "Action expired": 31854,
    "Insufficient payment": 46647,
    "Table full": 47952,
    "Action not found": 48966,
    "Contract not stopped": 53296,
    "Invalid table number": 53969,
    "Invalid co-signer": 61115,
    "Previous table not active": 61139,
    "Owner not registered": 61400,
} as const

const MatrixTON_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Register","header":256,"fields":[{"name":"referrer","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"BuyTable","header":257,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"ChangeMaster","header":512,"fields":[{"name":"newMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"coSigner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ConfirmAdminAction","header":513,"fields":[{"name":"actionId","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"ChangeSystemWallet","header":514,"fields":[{"name":"newSystemWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"coSigner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"UpgradeLogic","header":515,"fields":[{"name":"newCode","type":{"kind":"simple","type":"cell","optional":false}},{"name":"coSigner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"EmergencyWithdraw","header":516,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"coSigner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetPaused","header":517,"fields":[{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"SetCoSigner","header":518,"fields":[{"name":"coSigner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"EventSlotFilled","header":768,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"slotNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"source","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"EventPayout","header":769,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"slotNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"EventFrozen","header":770,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"frozenAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"EventUnfrozen","header":771,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"nextTableActivated","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"EventSpillover","header":772,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"fromUser","type":{"kind":"simple","type":"address","optional":false}},{"name":"toUser","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"hops","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"EventReactivation","header":773,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"cycleCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"EventTableActivated","header":774,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"triggeredBy","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"EventPayoutBounced","header":775,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"EventUserRegistered","header":776,"fields":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"upline","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"EventSystemFee","header":777,"fields":[{"name":"tableNum","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"feeType","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"UserTable","header":null,"fields":[{"name":"active","type":{"kind":"simple","type":"bool","optional":false}},{"name":"slotsFilled","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"slot1","type":{"kind":"simple","type":"address","optional":true}},{"name":"slot2","type":{"kind":"simple","type":"address","optional":true}},{"name":"slot3","type":{"kind":"simple","type":"address","optional":true}},{"name":"slot4","type":{"kind":"simple","type":"address","optional":true}},{"name":"frozen2Amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"cycleCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"UserData","header":null,"fields":[{"name":"registered","type":{"kind":"simple","type":"bool","optional":false}},{"name":"upline","type":{"kind":"simple","type":"address","optional":false}},{"name":"isMaster","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"PendingAction","header":null,"fields":[{"name":"actionType","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"initiator","type":{"kind":"simple","type":"address","optional":false}},{"name":"coSigner","type":{"kind":"simple","type":"address","optional":false}},{"name":"newAddress","type":{"kind":"simple","type":"address","optional":true}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"newCode","type":{"kind":"simple","type":"cell","optional":true}},{"name":"expiry","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"MatrixTON$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"masterWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"systemWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"stopped","type":{"kind":"simple","type":"bool","optional":false}},{"name":"coSigner","type":{"kind":"simple","type":"address","optional":false}},{"name":"processing","type":{"kind":"simple","type":"bool","optional":false}},{"name":"users","type":{"kind":"dict","key":"address","value":"UserData","valueFormat":"ref"}},{"name":"userTables1","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables2","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables3","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables4","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables5","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables6","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables7","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables8","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables9","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables10","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables11","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"userTables12","type":{"kind":"dict","key":"address","value":"UserTable","valueFormat":"ref"}},{"name":"pendingActions","type":{"kind":"dict","key":"int","value":"PendingAction","valueFormat":"ref"}},{"name":"nextActionId","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"bouncedPayouts","type":{"kind":"dict","key":"address","value":"int"}},{"name":"totalUsers","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"totalPayouts","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalSystemFees","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
]

const MatrixTON_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "Register": 256,
    "BuyTable": 257,
    "ChangeMaster": 512,
    "ConfirmAdminAction": 513,
    "ChangeSystemWallet": 514,
    "UpgradeLogic": 515,
    "EmergencyWithdraw": 516,
    "SetPaused": 517,
    "SetCoSigner": 518,
    "EventSlotFilled": 768,
    "EventPayout": 769,
    "EventFrozen": 770,
    "EventUnfrozen": 771,
    "EventSpillover": 772,
    "EventReactivation": 773,
    "EventTableActivated": 774,
    "EventPayoutBounced": 775,
    "EventUserRegistered": 776,
    "EventSystemFee": 777,
}

const MatrixTON_getters: ABIGetter[] = [
    {"name":"getUserData","methodId":86856,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"UserData","optional":true}},
    {"name":"getUserTable","methodId":105808,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"tableNum","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"UserTable","optional":true}},
    {"name":"isRegistered","methodId":104754,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"getUpline","methodId":122880,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"getTablePrice","methodId":102466,"arguments":[{"name":"tableNum","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getPayoutAmount","methodId":122726,"arguments":[{"name":"tableNum","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getSystemFee","methodId":82952,"arguments":[{"name":"tableNum","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getMasterWallet","methodId":74928,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"getSystemWallet","methodId":84311,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"getCoSigner","methodId":86876,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"getContractBalance","methodId":111492,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isStopped","methodId":68877,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"getBouncedPayouts","methodId":93320,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"findSpilloverTarget","methodId":107741,"arguments":[{"name":"startUser","type":{"kind":"simple","type":"address","optional":false}},{"name":"tableNum","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"getPendingAction","methodId":83890,"arguments":[{"name":"actionId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"PendingAction","optional":true}},
    {"name":"getStats","methodId":104054,"arguments":[],"returnType":{"kind":"dict","key":"int","value":"int"}},
    {"name":"getUserAllTables","methodId":109146,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"dict","key":"int","value":"int"}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"stopped","methodId":74107,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

export const MatrixTON_getterMapping: { [key: string]: string } = {
    'getUserData': 'getGetUserData',
    'getUserTable': 'getGetUserTable',
    'isRegistered': 'getIsRegistered',
    'getUpline': 'getGetUpline',
    'getTablePrice': 'getGetTablePrice',
    'getPayoutAmount': 'getGetPayoutAmount',
    'getSystemFee': 'getGetSystemFee',
    'getMasterWallet': 'getGetMasterWallet',
    'getSystemWallet': 'getGetSystemWallet',
    'getCoSigner': 'getGetCoSigner',
    'getContractBalance': 'getGetContractBalance',
    'isStopped': 'getIsStopped',
    'getBouncedPayouts': 'getGetBouncedPayouts',
    'findSpilloverTarget': 'getFindSpilloverTarget',
    'getPendingAction': 'getGetPendingAction',
    'getStats': 'getGetStats',
    'getUserAllTables': 'getGetUserAllTables',
    'owner': 'getOwner',
    'stopped': 'getStopped',
}

const MatrixTON_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"Register"}},
    {"receiver":"internal","message":{"kind":"typed","type":"BuyTable"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetCoSigner"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPaused"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeMaster"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeSystemWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpgradeLogic"}},
    {"receiver":"internal","message":{"kind":"typed","type":"EmergencyWithdraw"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ConfirmAdminAction"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"text","text":"Resume"}},
    {"receiver":"internal","message":{"kind":"text","text":"Stop"}},
]

export const TABLE_1_PRICE = 10000000000n;
export const TABLE_2_PRICE = 20000000000n;
export const TABLE_3_PRICE = 40000000000n;
export const TABLE_4_PRICE = 80000000000n;
export const TABLE_5_PRICE = 160000000000n;
export const TABLE_6_PRICE = 320000000000n;
export const TABLE_7_PRICE = 640000000000n;
export const TABLE_8_PRICE = 1280000000000n;
export const TABLE_9_PRICE = 2560000000000n;
export const TABLE_10_PRICE = 5120000000000n;
export const TABLE_11_PRICE = 10240000000000n;
export const TABLE_12_PRICE = 20480000000000n;
export const ENTRY_FEE = 500000000n;
export const EXIT_FEE = 500000000n;
export const SYSTEM_FEE_PERCENT = 10n;
export const MIN_CONTRACT_BALANCE = 1000000000n;
export const GAS_RESERVE = 300000000n;
export const MAX_TABLES = 12n;
export const MAX_SLOTS = 4n;
export const MAX_HOPS = 100n;

export class MatrixTON implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = MatrixTON_errors_backward;
    public static readonly opcodes = MatrixTON_opcodes;
    
    static async init(masterWallet: Address, systemWallet: Address, coSigner: Address) {
        return await MatrixTON_init(masterWallet, systemWallet, coSigner);
    }
    
    static async fromInit(masterWallet: Address, systemWallet: Address, coSigner: Address) {
        const __gen_init = await MatrixTON_init(masterWallet, systemWallet, coSigner);
        const address = contractAddress(0, __gen_init);
        return new MatrixTON(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new MatrixTON(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  MatrixTON_types,
        getters: MatrixTON_getters,
        receivers: MatrixTON_receivers,
        errors: MatrixTON_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: Register | BuyTable | SetCoSigner | SetPaused | ChangeMaster | ChangeSystemWallet | UpgradeLogic | EmergencyWithdraw | ConfirmAdminAction | Deploy | "Resume" | "Stop") {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Register') {
            body = beginCell().store(storeRegister(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'BuyTable') {
            body = beginCell().store(storeBuyTable(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetCoSigner') {
            body = beginCell().store(storeSetCoSigner(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetPaused') {
            body = beginCell().store(storeSetPaused(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeMaster') {
            body = beginCell().store(storeChangeMaster(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeSystemWallet') {
            body = beginCell().store(storeChangeSystemWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpgradeLogic') {
            body = beginCell().store(storeUpgradeLogic(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'EmergencyWithdraw') {
            body = beginCell().store(storeEmergencyWithdraw(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ConfirmAdminAction') {
            body = beginCell().store(storeConfirmAdminAction(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message === "Resume") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === "Stop") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetUserData(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('getUserData', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleUserData(result_p) : null;
        return result;
    }
    
    async getGetUserTable(provider: ContractProvider, user: Address, tableNum: bigint) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        builder.writeNumber(tableNum);
        const source = (await provider.get('getUserTable', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleUserTable(result_p) : null;
        return result;
    }
    
    async getIsRegistered(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('isRegistered', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetUpline(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('getUpline', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
    async getGetTablePrice(provider: ContractProvider, tableNum: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(tableNum);
        const source = (await provider.get('getTablePrice', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetPayoutAmount(provider: ContractProvider, tableNum: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(tableNum);
        const source = (await provider.get('getPayoutAmount', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetSystemFee(provider: ContractProvider, tableNum: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(tableNum);
        const source = (await provider.get('getSystemFee', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetMasterWallet(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getMasterWallet', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetSystemWallet(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getSystemWallet', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetCoSigner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getCoSigner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetContractBalance(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getContractBalance', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getIsStopped(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('isStopped', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetBouncedPayouts(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('getBouncedPayouts', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getFindSpilloverTarget(provider: ContractProvider, startUser: Address, tableNum: bigint) {
        const builder = new TupleBuilder();
        builder.writeAddress(startUser);
        builder.writeNumber(tableNum);
        const source = (await provider.get('findSpilloverTarget', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetPendingAction(provider: ContractProvider, actionId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(actionId);
        const source = (await provider.get('getPendingAction', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTuplePendingAction(result_p) : null;
        return result;
    }
    
    async getGetStats(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getStats', builder.build())).stack;
        const result = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
        return result;
    }
    
    async getGetUserAllTables(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('getUserAllTables', builder.build())).stack;
        const result = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getStopped(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('stopped', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
}