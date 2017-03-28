// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import { toHex } from '../util/format';
import { TransportError } from '../transport';

const AWAITING = Symbol('awaiting');
const CONFIRMED = Symbol('confirmed');
const REJECTED = Symbol('rejected');

class Transactions {
  constructor () {
    this.reset();
  }

  // should only really be needed in the constructor and tests
  reset () {
    this._id = 1;
    this._states = {};
  }

  nextId () {
    return toHex(this._id++);
  }

  add (tx) {
    const id = this.nextId();

    this._states[id] = {
      status: AWAITING,
      transaction: tx
    };

    return id;
  }

  get (id) {
    const state = this._states[id];

    if (!state || state.status !== AWAITING) {
      return null;
    }

    return state.transaction;
  }

  hash (id) {
    const state = this._states[id];

    if (!state) {
      return null;
    }

    switch (state.status) {
      case REJECTED:
        throw TransportError.requestRejected();
      case CONFIRMED:
        return state.hash;
      default:
        return null;
    }
  }

  confirm (id, hash) {
    const state = this._states[id];

    if (!state || state.status !== AWAITING) {
      throw new Error('Trying to confirm an invalid transaction');
    }

    state.hash = hash;
    state.status = CONFIRMED;
  }

  reject (id) {
    const state = this._states[id];

    if (!state) {
      return false;
    }

    state.status = REJECTED;

    return true;
  }

  requestsToConfirm () {
    const result = [];

    Object.keys(this._states).forEach((id) => {
      const state = this._states[id];

      if (state.status === AWAITING) {
        result.push({
          id,
          origin: {
            signer: '0x0'
          },
          payload: {
            sendTransaction: state.transaction
          }
        });
      }
    });

    return result;
  }
}

export default new Transactions();
