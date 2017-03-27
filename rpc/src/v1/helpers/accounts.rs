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

use std::sync::{Arc, Weak};

use ethcore::account_provider::AccountProvider;
use jsonrpc_core::{Error, ErrorCode};

pub fn unwrap_provider(provider: &Option<Weak<AccountProvider>>) -> Result<Arc<AccountProvider>, Error> {
	match *provider {
		Some(ref weak) => weak.upgrade().ok_or_else(Error::internal_error),
		None => Err(Error {
			code: ErrorCode::InvalidRequest,
			message: "Method disallowed when running parity as a public node.".into(),
			data: None,
		}),
	}
}
