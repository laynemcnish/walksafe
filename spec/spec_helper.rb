require_relative "./../app"
require "capybara/rspec"
require "gschool_database_connection"
ENV["RACK_ENV"] = "test"

Capybara.app = App

database_connection = GschoolDatabaseConnection::DatabaseConnection.establish(ENV["RACK_ENV"])

RSpec.configure do |config|
  config.before do
    database_connection = GschoolDatabaseConnection::DatabaseConnection.establish(ENV["RACK_ENV"])

    database_connection.sql("BEGIN")
  end

  config.after do
    database_connection = GschoolDatabaseConnection::DatabaseConnection.establish(ENV["RACK_ENV"])

    database_connection.sql("ROLLBACK")
  end
end
