import Dexie from 'dexie';
import Accounts, {AccountsScheme} from './accounts';
import MyAccounts, {MyAccountsScheme} from './my_accounts';

// Note:
// Simply notify tables' type information to TypeScript compiler
// https://github.com/dfahlander/Dexie.js/wiki/Typescript#create-a-subclass
interface TypedDexie extends Dexie {
    accounts: Dexie.Table<AccountsScheme, number>;
    my_accounts: Dexie.Table<MyAccountsScheme, number>;
}

export class Database {
    db: TypedDexie;
    accounts: Accounts;
    my_accounts: MyAccounts;

    constructor () {
        this.db = new Dexie('YourFukurou') as TypedDexie;
        this.db.version(1).stores({
            accounts: Accounts.getScheme(1),
            my_accounts: MyAccounts.getScheme(1),
        });

        this.accounts = new Accounts(this.db.accounts);
        this.my_accounts = new MyAccounts(this.db.my_accounts);
    }
}

export default new Database();
