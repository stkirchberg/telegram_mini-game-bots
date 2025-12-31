import os
import threading
import time
from datetime import datetime
from telebot import TeleBot


MAIN_BOT_TOKEN = "123456789:AAAbbbCCCdddEEEfffGGGhhhIIIjjjKKK"
bot = TeleBot(MAIN_BOT_TOKEN)

GAME_URL = "https://gomoku-stk.netlify.app/"
GAME_SHORT_NAME = "gomoku_bot_stk"


@bot.callback_query_handler(func=lambda call: True)
def game_handler(call):
    if call.game_short_name == GAME_SHORT_NAME:
        bot.answer_callback_query(
            callback_query_id=call.id,
            url=GAME_URL
        )


@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.send_message(
        message.chat.id,
        "Welcome! Click the button below to play Gomoku."
    )
    bot.send_game(
        message.chat.id,
        GAME_SHORT_NAME
    )


@bot.message_handler(commands=['game'])
def send_game(message):
    bot.send_game(
        message.chat.id,
        GAME_SHORT_NAME
    )


PING_BOT_TOKEN = "9876543210:AAZzzYYYxxxWWWvvvUUUtttSSSrrrQQQ"
ping_bot = TeleBot(PING_BOT_TOKEN)

ping_users = set() 


@ping_bot.message_handler(commands=['start'])
def ping_start(message):
    ping_users.add(message.chat.id)
    ping_bot.send_message(message.chat.id, "Online ping enabled for the Gomoku Bot.")


def online_ping_loop():
    last_sent_minute = None

    while True:
        now = datetime.now()
        minute = now.minute

        if minute in (2, 32) and minute != last_sent_minute:
            timestamp = now.strftime("%d.%m.%Y %H:%M")

            text = (
                f"<b>{timestamp}</b>\n"
                f"Gomoku Bot is online."
            )

            for chat_id in list(ping_users):
                try:
                    ping_bot.send_message(
                        chat_id,
                        text,
                        parse_mode="HTML"
                    )
                except Exception as e:
                    print(f"Ping failed for {chat_id}: {e}")

            last_sent_minute = minute

        time.sleep(20)




if __name__ == "__main__":
    print("Bots started...")

    threading.Thread(target=online_ping_loop, daemon=True).start()
    threading.Thread(target=ping_bot.infinity_polling, daemon=True).start()

    bot.infinity_polling()