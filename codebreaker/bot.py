import os
from telebot import TeleBot

TOKEN = "12345678:AAAbbbbCCCddDDdeEEEffffGGGhhhIIII"

bot = TeleBot("12345678:AAAbbbbCCCddDDdeEEEffffGGGhhhIIII")

GAME_URL = "https://codebreaker-stk.netlify.app/"
GAME_SHORT_NAME = "colorbreaker_bot_stk"

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
        "Welcome! Click the button below to play Color Codebreaker."
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

if __name__ == "__main__":
    print("Bot started...")
    bot.infinity_polling()
