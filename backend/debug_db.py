import mysql.connector
from mysql.connector import Error

def create_server_connection(host_name, user_name, user_password):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password
        )
        print("MySQL Database connection successful")
    except Error as err:
        print(f"Error: '{err}'")

    return connection

def create_db_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password,
            database=db_name
        )
        print("MySQL Database connection successful")
    except Error as err:
        print(f"Error: '{err}'")

    return connection

def execute_query(connection, query):
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        connection.commit()
        print("Query successful")
    except Error as err:
        print(f"Error: '{err}'")

# Test 1: Connect to Server (no DB)
print("--- Test 1: Connect to MySQL Server (root, no pass) ---")
connection = create_server_connection("localhost", "root", "")

if connection:
    # Test 2: Check if DB exists
    print("\n--- Test 2: Check for database 'college_hub' ---")
    cursor = connection.cursor()
    cursor.execute("SHOW DATABASES LIKE 'college_hub'")
    result = cursor.fetchone()
    if result:
        print("Database 'college_hub' exists.")
    else:
        print("Database 'college_hub' does NOT exist.")
        # Try to create it?
        print("Attempting to create database...")
        try:
            cursor.execute("CREATE DATABASE college_hub")
            print("Database 'college_hub' created successfully.")
        except Error as err:
            print(f"Failed to create database: {err}")

    connection.close()
else:
    print("\nCould not connect to MySQL server. Check if it is running and password is empty.")
