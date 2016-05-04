import Dexie from 'dexie';
import Accounts, {AccountsTable} from './accounts';
import MyAccounts, {MyAccountsTable} from './my_accounts';
import Hashtags, {HashtagsTable} from './hashtags';
import Statuses, {StatusesTable} from './statuses';
import RejectedIds, {RejectedIdsTable} from './rejected_ids';

// Note:
// Simply notify tables' type information to TypeScript compiler
// https://github.com/dfahlander/Dexie.js/wiki/Typescript#create-a-subclass
interface TypedDexie extends Dexie {
    accounts: AccountsTable;
    my_accounts: MyAccountsTable;
    hashtags: HashtagsTable;
    statuses: StatusesTable;
    rejected_ids: RejectedIdsTable;
}

export class Database {
    db: TypedDexie;
    accounts: Accounts;
    my_accounts: MyAccounts;
    hashtags: Hashtags;
    statuses: Statuses;
    rejected_ids: RejectedIds;

    constructor () {
        this.db = new Dexie('YourFukurou') as TypedDexie;
        this.db.version(1).stores({
            accounts: Accounts.getScheme(1),
            my_accounts: MyAccounts.getScheme(1),
            hashtags: Hashtags.getScheme(1),
            statuses: Statuses.getScheme(1),
            rejected_ids: RejectedIds.getScheme(1),
        });

        this.accounts = new Accounts(this.db.accounts);
        this.my_accounts = new MyAccounts(this.db.my_accounts);
        this.hashtags = new Hashtags(this.db.hashtags);
        this.statuses = new Statuses(this.db.statuses);
        this.rejected_ids = new RejectedIds(this.db.rejected_ids);
    }
}

export default new Database();
