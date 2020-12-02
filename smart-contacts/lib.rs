#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod point {

    #[cfg(not(feature = "ink-as-dependency"))]
    use ink_storage::{
        collections::HashMap as storageHashMap,
    };

    #[ink(storage)]
    pub struct Point {
        /// Tokens issued by the point issuer.
        owner_points: Balance,

        /// Authority to give points.
        authority: storageHashMap<AccountId, bool>,
        /// Points granted by the point giver.
        store_points: storageHashMap<AccountId, Balance>,
        /// Points by point giver user(store, user).
        store_user_points: storageHashMap<(AccountId, AccountId), Balance>,

        /// User Acquisition Points.
        user_points: storageHashMap<AccountId, Balance>,
    }

    /// Event that occurs when a token issue occurs.
    #[ink(event)]
    pub struct Issuance {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        value: Balance,
    }

    /// Event that occurs when an authorization occurs.
    #[ink(event)]
    pub struct Authority {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        store: AccountId,
        #[ink(topic)]
        auth: bool,
    }

    /// Events that occur when a point is granted to a user or when a point is used.
    #[ink(event)]
    pub struct UserPoints {
        #[ink(topic)]
        store: AccountId,
        #[ink(topic)]
        user: AccountId,
        #[ink(topic)]
        value: Balance,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotAuthority,
        InsufficientBalance
    }
    pub type Result<T> = core::result::Result<T, Error>;

    impl Point {
        /// Constructor that initializes.
        #[ink(constructor)]
        pub fn new(init_value: Balance) -> Self {
            let initial = Self {
                owner_points: init_value,
                authority: storageHashMap::new(),
                store_points: storageHashMap::new(),
                store_user_points: storageHashMap::new(),
                user_points: storageHashMap::new(),
            };

            Self::env().emit_event(
                Issuance {
                    owner: Self::env().caller(),
                    value: init_value,
                }
            );

            initial
        }


        // Points issuers can issue their own branded tokens.
        /// ポイント発行者は独自ブランドのトークンを発行できる
        #[ink(message)]
        pub fn issuance_points(&mut self, value: Balance) -> Result<()> {
            self.owner_points += value;

            self.env().emit_event(
                Issuance {
                    owner: self.env().caller(),
                    value: value,
                }
            );

            Ok(())
        }

        // Point issuers can authorize a point grantor to grant points.
        /// ポイント発行者はポイント付与者にポイント付与権限を与えられる
        #[ink(message)]
        pub fn give_authority(&mut self, store: AccountId) -> Result<()> {
            let current_auth = self.is_authority(store);
            self.authority.insert(store, !current_auth);

            self.env().emit_event(
                Authority {
                    owner: self.env().caller(),
                    store: store,
                    auth: !current_auth,
                }
            );

            Ok(())
        }

        // Points can be awarded to users who meet the point-granting conditions.
        /// ポイント付与者はポイント付与条件に合致したユーザにポイント付与できる
        #[ink(message)]
        pub fn give_user_points(&mut self, store: AccountId, user: AccountId, value: Balance) -> Result<()> {
            let auth = self.is_authority(store);
            if !auth {
                return Err(Error::NotAuthority);
            }

            // Add the points granted by the point giver.
            self.add_store_points(store, user, value)?;

            // Adding points to the user.
            let point = self.user_points_or_zero(&user);
            self.inc_user_points(user, point + value)?;

            self.env().emit_event(
                UserPoints {
                    store: store,
                    user: user,
                    value: value,
                }
            );

            Ok(())
        }

        // Point issuers can see how many points they have issued.
        /// ポイント発行者は発行済ポイント数を確認できる
        #[ink(message)]
        pub fn get_owner_points(&self) -> Balance {
            self.owner_points
        }

        // Point issuers can check the number of points granted by the point grantee for each point grantee.
        /// ポイント発行者はポイント付与者が付与したポイント数をポイント付与者毎に確認できる
        #[ink(message)]
        pub fn get_store_points(&self, store: AccountId) -> Balance {
            self.store_points_or_zero(&store)
        }

        // Point grantor can check the number of points granted to each user.
        /// ポイント付与者は自身が付与したポイント数をユーザ毎に確認できる
        #[ink(message)]
        pub fn get_store_user_points(&mut self, store: AccountId, user: AccountId) -> Balance {
            self.store_user_points_or_zero(&store, &user)
        }

        // Users can see how many points they have earned.
        /// ユーザは自身が獲得したポイント数を確認できる
        #[ink(message)]
        pub fn get_user_points(&mut self, user: AccountId) -> Balance {
            self.user_points_or_zero(&user)
        }

        // Users can use the services of the point-grantor with the points they have earned.
        /// ユーザは獲得したポイントを使ってポイント付与者のサービスが利用できる
        #[ink(message)]
        pub fn use_user_points(&mut self, store: AccountId, user: AccountId, value: Balance) -> Result<()> {
            let point = self.user_points_or_zero(&user);
            // Check if you have enough balance.
            if point < value {
                return Err(Error::InsufficientBalance);
            }

            self.inc_user_points(user, point - value)?;

            self.env().emit_event(
                UserPoints {
                    store: store,
                    user: user,
                    value: value,
                }
            );

            Ok(())
        }

        /// Authority of point giver.
        #[ink(message)]
        pub fn is_authority(&self, store: AccountId) -> bool {
            self.authority_or_false(&store)
        }

        /// Get point granting authority.
        /// ポイント付与権限を取得
        /// 取得できないときはfalseを返す
        fn authority_or_false(&self, store: &AccountId) -> bool {
            *self.authority.get(store).unwrap_or(&false)
        }

        /// Points by point issuer point grantor.
        /// ポイント発行者ポイント付与者別のポイント
        /// 取得できないときはゼロを返す
        fn store_points_or_zero(&self, store: &AccountId) -> Balance {
            *self.store_points.get(store).unwrap_or(&0)
        }

        /// Points by point grantor user.
        /// ポイント付与者ユーザ別のポイント
        /// 取得できないときはゼロを返す
        fn store_user_points_or_zero(&self, store: &AccountId, user: &AccountId) -> Balance {
            *self.store_user_points.get(&(*store, *user)).unwrap_or(&0)
        }

        /// Get the user's points.
        /// ユーザのポイントを取得
        /// 取得できないときはゼロを返す
        fn user_points_or_zero(&self, user: &AccountId) -> Balance {
            *self.user_points.get(user).unwrap_or(&0)
        }

        /// Add the points granted by the point giver to the user.(store)
        /// ポイント付与者がユーザへ付与したポイントを加算(ポイント付与者)
        fn add_store_points(&mut self, store: AccountId, user: AccountId, value: Balance) -> Result<()> {
            let store_point = self.store_points_or_zero(&store);
            self.store_points.insert(store, store_point + value);

            let user_point = self.store_user_points_or_zero(&store, &user);
            self.store_user_points.insert((store, user), user_point + value);

            Ok(())
        }

        /// Update User points.
        /// ユーザのポイントを更新
        fn inc_user_points(&mut self, user: AccountId, value: Balance) -> Result<()> {
            self.user_points.insert(user, value);

            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        use ink_lang as ink;

        /// test the new.
        #[ink::test]
        fn new_works() {
            let point = Point::new(100);
            assert_eq!(point.get_owner_points(), 100);
        }

        /// test the issuance_points.
        #[ink::test]
        fn issuance_points_works() {
            let mut point = Point::new(100);
            assert_eq!(point.get_owner_points(), 100);
            // call issuance_points.
            assert_eq!(point.issuance_points(50), Ok(()));
            assert_eq!(point.get_owner_points(), 150);
        }

        /// test the give_authority.
        #[ink::test]
        fn give_authority_works() {
            let mut point = Point::new(100);
            assert_eq!(point.is_authority(AccountId::from([0x0; 32])), false);
            // call give_authority.
            assert_eq!(point.give_authority(AccountId::from([0x0; 32])), Ok(()));
            assert_eq!(point.is_authority(AccountId::from([0x0; 32])), true);
        }

        /// test the give_user_points.
        #[ink::test]
        fn give_user_points_works() {
            let mut point = Point::new(100);
            assert_eq!(point.get_store_points(AccountId::from([0x1; 32])), 0);
            assert_eq!(point.get_store_user_points(AccountId::from([0x1; 32]), AccountId::from([0x0; 32])), 0);
            assert_eq!(point.get_user_points(AccountId::from([0x0; 32])), 0);
            // call give_user_points(error).
            assert_eq!(point.give_user_points(AccountId::from([0x1; 32]), AccountId::from([0x0; 32]), 80), Err(Error::NotAuthority));
            // call give_authority.
            assert_eq!(point.give_authority(AccountId::from([0x1; 32])), Ok(()));
            // call give_user_points.
            assert_eq!(point.give_user_points(AccountId::from([0x1; 32]), AccountId::from([0x0; 32]), 80), Ok(()));
            assert_eq!(point.get_store_points(AccountId::from([0x1; 32])), 80);
            assert_eq!(point.get_store_user_points(AccountId::from([0x1; 32]), AccountId::from([0x0; 32])), 80);
            assert_eq!(point.get_user_points(AccountId::from([0x0; 32])), 80);
        }

        /// test the use_user_points.
        #[ink::test]
        fn use_user_points_works() {
            let mut point = Point::new(100);
            assert_eq!(point.get_user_points(AccountId::from([0x0; 32])), 0);
            // call give_user_points.
            assert_eq!(point.give_authority(AccountId::from([0x1; 32])), Ok(()));
            assert_eq!(point.give_user_points(AccountId::from([0x1; 32]), AccountId::from([0x0; 32]), 80), Ok(()));
            assert_eq!(point.get_user_points(AccountId::from([0x0; 32])), 80);
            // call use_user_points.
            assert_eq!(point.use_user_points(AccountId::from([0x1; 32]), AccountId::from([0x0; 32]), 50), Ok(()));
            assert_eq!(point.get_user_points(AccountId::from([0x0; 32])), 30);
            // call use_user_points(error).
            assert_eq!(point.use_user_points(AccountId::from([0x1; 32]), AccountId::from([0x0; 32]), 100), Err(Error::InsufficientBalance));
        }
    }
}
