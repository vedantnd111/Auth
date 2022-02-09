"""Python client"""

from socket import timeout
import requests as req
from pprint import pprint
import json
import time
from requests_toolbelt import MultipartEncoder

# with open("./citylots.json", "rb") as fi:
#     data = json.load(fi)

# generator will return data in parts
def generator_function(data):
    print("inside generator")
    while True:
        d1 = data.read(1024)
        if not d1:
            break
        yield d1


def uploading_chunks():
    count = 0
    content_type = "application/json"
    with open("./data.json", "rb") as fi:
        for file in generator_function(fi):
            try:
                time.sleep(10)
                r = req.post(
                    url + "/post",
                    timeout=30,
                    data=file,
                )
                print("count=", count)
                r.raise_for_status()
                print("status_code=", r.status_code)
                print(r.headers)
            except Exception as e:
                print("error occured!")
        # for file in generator_function(fi):
        #     r = req.post(
        #         url + "/post",
        #         data=file,
        #         headers={
        #             "Content-Type": "application/json"
        #         },
        #     )
        #     r.raise_for_status()
        #     print("status_code=", r.status_code)
        #     pprint(r.headers)
        #     pprint(r.json())


# load method reads the json data and stores it dictionary
with open("./citylots.json", "rb") as fi:
    data = json.load(fi)

# it will return an multipart encoder for multipart streaming data we are returning data in this
def encoder():
    return MultipartEncoder(fields={"field0": json.dumps(data)})


# it will do the same work as above but in this we are only sending data in binary
def encoder_with_file():
    return MultipartEncoder(
        fields={
            "field2": ("citylots.json", open("./citylots.json", "rb")),
        }
    )


def uploading_multiplart():
    # create_encoder = encoder()
    try:
        create_encoder_with_file = encoder_with_file()
        create_encoder = encoder()
        # monitor = MultipartEncoderMonitor(create_encoder, callback=my_callback)
        # time.sleep(1)
        r = req.post(
            url=url + "/post",
            data=create_encoder,
            headers={"Content-Type": create_encoder.content_type},
        )
        r.raise_for_status()
        print("status_code=", r.status_code)
        print(r.content)
    except timeout:
        print("time out..")
    except req.exceptions.ConnectionError as e:
        print("exception ocurred!", e)
        SystemExit(e)


url = "http://localhost:5000"
uploading_multiplart()
# uploading_chunks()
# endpoint = "/post"
# headers = {
#     "Content-Type": "application/json",
#     "Accept": "application/json",
#     "Transfer-Encoding": "chunked",
# }
# # res = req.get(url + "/")
# res = req.post(url=f"{url}{endpoint}", json=data)
# res.raise_for_status()
# print(res.status_code)
# pprint(res.json())
