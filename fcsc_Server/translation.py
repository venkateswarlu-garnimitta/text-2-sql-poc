from googletrans import Translator

async def translate_text_to_eng(text:str):
    async with Translator() as translator:
        result = await translator.translate(text, dest='en')
        return result.text


async def translate_text_to_ar(text:str):
    async with Translator() as translator:
        result = await translator.translate(text, dest='ar')
        return result.text

async def detect_languages(text:str):
    async with Translator() as translator:
        result = await translator.detect(text)
        return result.lang
