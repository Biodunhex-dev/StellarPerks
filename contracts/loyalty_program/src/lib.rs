#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Symbol,
};

// Storage keys
const ADMIN: Symbol = symbol_short!("ADMIN");
const PROGRAMS: Symbol = symbol_short!("PROGRAMS");
const EVENTS: Symbol = symbol_short!("EVENTS");

#[contracttype]
#[derive(Clone)]
pub struct LoyaltyProgram {
    pub id: String,
    pub name: String,
    pub owner: Address,
    pub points_per_unit: u64,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct EventRecord {
    pub program_id: String,
    pub user: Address,
    pub action: String,
    pub points: i64,
    pub timestamp: u64,
}

#[contract]
pub struct LoyaltyContract;

#[contractimpl]
impl LoyaltyContract {
    /// Initialize contract with admin
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN, &admin);
        let programs: Map<String, LoyaltyProgram> = Map::new(&env);
        env.storage().instance().set(&PROGRAMS, &programs);
    }

    /// Create a new loyalty program
    pub fn create_program(
        env: Env,
        owner: Address,
        program_id: String,
        name: String,
        points_per_unit: u64,
    ) {
        owner.require_auth();
        let mut programs: Map<String, LoyaltyProgram> = env
            .storage()
            .instance()
            .get(&PROGRAMS)
            .unwrap_or(Map::new(&env));

        if programs.contains_key(program_id.clone()) {
            panic!("program already exists");
        }

        programs.set(
            program_id.clone(),
            LoyaltyProgram {
                id: program_id,
                name,
                owner,
                points_per_unit,
                active: true,
            },
        );
        env.storage().instance().set(&PROGRAMS, &programs);
    }

    /// Issue points to a user
    pub fn issue_points(
        env: Env,
        caller: Address,
        program_id: String,
        user: Address,
        points: u64,
    ) {
        caller.require_auth();
        let programs: Map<String, LoyaltyProgram> = env
            .storage()
            .instance()
            .get(&PROGRAMS)
            .unwrap_or(Map::new(&env));

        let program = programs.get(program_id.clone()).expect("program not found");
        if program.owner != caller {
            panic!("not program owner");
        }
        if !program.active {
            panic!("program inactive");
        }

        let balance_key = (program_id.clone(), user.clone());
        let current: u64 = env
            .storage()
            .persistent()
            .get(&balance_key)
            .unwrap_or(0u64);
        env.storage()
            .persistent()
            .set(&balance_key, &(current + points));

        Self::record_event(
            &env,
            program_id,
            user,
            String::from_str(&env, "issue"),
            points as i64,
        );
    }

    /// Redeem points from a user
    pub fn redeem_points(
        env: Env,
        user: Address,
        program_id: String,
        points: u64,
    ) {
        user.require_auth();
        let programs: Map<String, LoyaltyProgram> = env
            .storage()
            .instance()
            .get(&PROGRAMS)
            .unwrap_or(Map::new(&env));

        let program = programs.get(program_id.clone()).expect("program not found");
        if !program.active {
            panic!("program inactive");
        }

        let balance_key = (program_id.clone(), user.clone());
        let current: u64 = env
            .storage()
            .persistent()
            .get(&balance_key)
            .unwrap_or(0u64);

        if current < points {
            panic!("insufficient points");
        }
        env.storage()
            .persistent()
            .set(&balance_key, &(current - points));

        Self::record_event(
            &env,
            program_id,
            user,
            String::from_str(&env, "redeem"),
            -(points as i64),
        );
    }

    /// Get user balance for a program
    pub fn get_balance(env: Env, program_id: String, user: Address) -> u64 {
        let balance_key = (program_id, user);
        env.storage()
            .persistent()
            .get(&balance_key)
            .unwrap_or(0u64)
    }

    /// Get program details
    pub fn get_program(env: Env, program_id: String) -> LoyaltyProgram {
        let programs: Map<String, LoyaltyProgram> = env
            .storage()
            .instance()
            .get(&PROGRAMS)
            .unwrap_or(Map::new(&env));
        programs.get(program_id).expect("program not found")
    }

    /// Deactivate a program
    pub fn deactivate_program(env: Env, owner: Address, program_id: String) {
        owner.require_auth();
        let mut programs: Map<String, LoyaltyProgram> = env
            .storage()
            .instance()
            .get(&PROGRAMS)
            .unwrap_or(Map::new(&env));

        let mut program = programs.get(program_id.clone()).expect("program not found");
        if program.owner != owner {
            panic!("not program owner");
        }
        program.active = false;
        programs.set(program_id, program);
        env.storage().instance().set(&PROGRAMS, &programs);
    }

    fn record_event(env: &Env, program_id: String, user: Address, action: String, points: i64) {
        env.events().publish(
            (EVENTS, program_id, user),
            (action, points, env.ledger().timestamp()),
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    #[test]
    fn test_create_and_issue() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(LoyaltyContract, ());
        let client = LoyaltyContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let owner = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin);

        let pid = String::from_str(&env, "prog1");
        let name = String::from_str(&env, "Test Program");
        client.create_program(&owner, &pid, &name, &10u64);

        client.issue_points(&owner, &pid, &user, &100u64);
        assert_eq!(client.get_balance(&pid, &user), 100u64);
    }

    #[test]
    fn test_redeem_points() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(LoyaltyContract, ());
        let client = LoyaltyContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let owner = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin);
        let pid = String::from_str(&env, "prog1");
        client.create_program(&owner, &pid, &String::from_str(&env, "P"), &10u64);
        client.issue_points(&owner, &pid, &user, &200u64);
        client.redeem_points(&user, &pid, &50u64);
        assert_eq!(client.get_balance(&pid, &user), 150u64);
    }

    #[test]
    #[should_panic(expected = "insufficient points")]
    fn test_redeem_insufficient() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(LoyaltyContract, ());
        let client = LoyaltyContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let owner = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin);
        let pid = String::from_str(&env, "prog1");
        client.create_program(&owner, &pid, &String::from_str(&env, "P"), &10u64);
        client.issue_points(&owner, &pid, &user, &10u64);
        client.redeem_points(&user, &pid, &100u64);
    }
}
