class User < ActiveRecord::Base


  validates :username, presence: true, uniqueness: {case_sensitive: false}
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email_address, presence: true, uniqueness: {case_sensitive: false}
  validates :password, presence: true

end