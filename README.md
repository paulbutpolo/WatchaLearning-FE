# Honest thoughts while I developed this project

Well anyway. With this task I think I got most of my problems

- I am not really good at planning
- I am not really good at designing
- If a Library is included and that library sucks then I suck. I am not able to work around on it

This project is actually the easiest if you compare it to my team mates projects, This project revolves around in
Uploading, Transcoding the Uploaded video, Uploading the transcoded video in a bucket (Object Storage) and Viewing the Stored Object

Once I manage to make a demo out of it the pieces just fall on the line easily, with that being said its not easy per say for me.
Since I made a plan for this I actually tried following it but it actually sucks. There are some part of the mongodb schema that I just filled and found some purpose but in reality the app can working without it. For example the subtitle collection and also the subtitle field in the video. In reality we dont fetch the url from there we fetch it by videoId and name and we just query it on backend because the subtitle is stored in the same folder of the video. Regardless I manage to use everything in the plan so I think its fine

Now Difficulties

Apparently HLS only uses .VTT now the difficult part was the sync of subtitle. When transcoding the video it actually made the video not sycn with the official subtitles. I don't know the reason for that behavior so can't comment with that so what we only need to do is just make the Subtitle sync, So to sync it we need to give some input then add it on the timestamp. Apparently you can just edit the .vtt file and insert it back. What I did is I converted it to .srt then insert the offset/delay then save it then convert it back to .vtt then reupload it to min.io. it took me 6 hours to figure that shit out, not gonna lie that was pathethic from me.

To be honest my Application is not a production class application. There is too many wholes
- JWT Token doesnt refresh if the user is still logged in or it doesnt automatically logs out the user if its expired
- Some endpoint in the back end can be accessed without the auth middleware because when I found out about it I was mostly done so yea
- Some of my routing doesnt make any sense
- The way I use a component sucks. The one thing I manage to share is the sidebar. I think I can do well if I just plan it properlly but that will take a lot of time so I just winged it
- When I created the backend I tried to use 1 single file. Thank god I didn't pushed through it but regardless the routing is messy. some of the route includes the other routes such as videos and learningpath. they should be seperated
- The transcoding is plainly pain in the ass. It's so resource intensive. I did not saw any threads on how to make it faster/efficient
- The way I call an API endpoint in the back end sucks. If i remember correctly I think I can store the root url then just attach the url later
- 