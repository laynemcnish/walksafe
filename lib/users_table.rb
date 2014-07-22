class UsersTable
  attr_reader :database_connection

  def initialize(database_connection)
    @database_connection = database_connection
  end

  def add_user(username, first_name, last_name, email_address, password)
    insert_user_sql = <<-SQL
    INSERT INTO users
    (username, first_name, last_name, email_address, password)
    VALUES ('#{username}', '#{first_name}', '#{last_name}', '#{email_address}', '#{password}')
    SQL
    @database_connection.sql(insert_user_sql)
  end

  def find_user(username, password)
    find_user = <<-SQL
    SELECT *
    FROM users
    WHERE username = '#{username}' AND password = '#{password}'
    SQL
    @database_connection.sql(find_user).first
  end

  def find_by_id(id)
    find_by_sql = <<-SQL
      SELECT username FROM users
      WHERE id = #{id}
    SQL

    @database_connection.sql(find_by_sql).first
  end

  def user_setter
    user_setter = <<-SQL
    SELECT username FROM users
    SQL
    @database_connection.sql(user_setter).collect { |hash| hash["username"] }
  end
end