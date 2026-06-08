1 . مقدمه
این مستند با هدف ارائه وب‌سرویس‌های مربوط به پیاده‌سازی ابزارهای پرداخت دیجی‌پی نگاشته شده است. به‌منظور درک بهتر، تعاریف اساسی در ادامه بیان شده و لیست سرویس‌های قابل‌ارائه فهرست گردیده است.

2 . دانلود پلاگین wordpress
برای دانلود پلاگین wordpress روی لینک زیر کلیک کنید.

دانلود پلاگین wordpress

3. تعاریف
در این بخش به تعریف مفاهیم و واژه‌های مورداستفاده پرداخته شده است

۱-3. درگاه پرداخت یکپارچه
منظور از درگاه پرداخت یکپارچه (َUPG)، سبدی است که ابزار پرداخت‌های ارائه شده توسط دیجی پی حسب نیازمندی کسب‌وکار را شامل می‌شود. این سبد شامل ابزار پرداخت‌های زیر است که هر یک در ادامه تعریف می‌شود:

• ابزار پرداخت BPG

• ابزار پرداخت CPG

• ابزار پرداخت Wallet

• ابزار پرداخت IPG

۱-۱-3. ابزار پرداخت BPG
منظور از این ابزار پرداخت، ایجاد امکان نمایش و خرج کرد وجه اعتبار خرید یا BNPL کاربران دیجی پی در وب‌سایت/ اپلیکیشن کسب‌وکار طرف قرارداد می‌باشد. اعتبار خرید، اعتباری است که دیجی پی بر اساس اعتبارسنجی و امتیازدهی با دو مدل بازپرداخت تک‌مرحله‌ای (بازپرداخت یکجا) و بازپرداخت ۴ مرحله‌ای (بازپرداخت در ۴ قسط) در اختیار کاربران خود قرار می‌دهد.

۲-۱-3. ابزار پرداخت CPG
ابزار پرداخت CPG، امکان نمایش و خرج کرد موجودی کیف پول اقساطی کاربران دیجی پی را در وب‌سایت/ اپلیکیشن کسب‌وکارهای طرف قرارداد دیجی پی فراهم می‌کند. کیف پول اقساطی، کیف پولی است که وجه آن از طریق تخصیص وام بانکی و تسهیلات به کاربران دیجی پی و واریز آن به کیف پول اقساطی آنها تأمین می‌شود.

۳-۱-3. ابزار پرداخت Wallet
با استفاده از این ابزار، امکان خرید با کیف پول نقدی کاربران دیجی پی در وب‌سایت/ اپلیکیشن کسب‌وکارهای طرف قرارداد دیجی پی فراهم می‌شود.

۴-۱-3.ابزار پرداخت IPG
ابزار پرداخت IPG دیجی پی، از طریق مسیردهی هوشمند با اتصال به چند درگاه پرداخت معتبر شاپرکی (PSP) امکان پرداخت در بستر اینترنت را فراهم می‌کند.

4. لاگین (ورود به اکوسیستم دیجی پی)
با هدف فراخوانی سرویس های دیجی پی نیاز است تا در مرحله اول توکن احراز هویت دریافت شود. این سرویس به منظور دریافت توکن احراز هویت فراخوانی می شود. مقدار توکن احراز هویت برای مدت زمان مشخصی معتبر است. برای تمدید این توکن میتوان از دیتای refresh_token استفاده کرد که جزییات پیاده سازی و نحوه فراخوانی وب سرویس آن در ادامه توضیح داده میشود.

برای لاگین در سیستم دی جی پی و فراخوانی سرویس توکن اطلاعاتی مانند نام کاربری، رمز عبور و ... مورد نیاز است که میتوانید از تیم پشتیبانی دیجی پی و یا پنل مربوطه آن را دریافت نمایید.

در ادامه این مستند ابتدا توضیح داده میشود که چگونه میتوان با مشخصات کاربری خود لاگین کرد و توکن دریافت نمود، سپس یک مورد استفاده از توکن مثال زده میشود و در انتها سرویس رفرش توکن مورد بررسی قرار میگیرد.

تمامی سرویس‌های معرفی شده در این سند بر پایه پروتکل ارتباطی REST طراحی شده است و آدرس پایه همه سرویس‌ها به صورت زیر خواهد بود:

https://uat.mydigipay.info/digipay/api	(staging) محیط تستی
https://api.mydigipay.com/digipay/api	(live) محیط عملیاتی
oauth/token	آدرس سرویس لاگین
POST	متد سرویس
بدنه این رکویست http باید بر اساس فرمت form-data ارسال شود و مقادیر فیلد های آن به صورت زیر است :

نوع	توضیح	مثال	نام پارامتر
string	نام کاربری	sampleUserName	username
string	رمز عبور	samplePassword	password
string	شیوه احراز هویت	همواره در این سرویس برابر مقدار password خواهد بود.	grant_type
جدول 1– مقادیر ارسالی سرویس دریافت توکن

در این سرویس علاوه بر مقادیری که در Body ریکوئست فرستاده میشود، فیلدی با عنوان Authorization در Header ریکوئست قرار میگیرد که مقدار آن بر اساس client_id و client_secret ای که در اختیارتان قرار داده میشود به دست می آید. برای ساخت این محتوا مقادیر client_id و client_secret به صورت زیر به یکدیگر متصل میشوند.

client_id:client_secret

برای مثال اگر کلاینت آی دی برابر iuyriwy88 و کلاینت سکرت برابر jhs65dfg باشد، محتوای ترکیب شده برابر iuyriwy88:jhs65dfg خواهد بود. پس از ترکیب این دو فیلد با کاراکتر دونقطه، کل این رشته باید به صورت base64 انکد شود. ( برای encode کردن میتوانید از سایت https://www.base64encode.org استفاده نمایید)

محتوای encode شده برای مثال بالا برابر aXV5cml3eTg4OmpoczY1ZGZn خواهد بود. در نهایت مقدار فیلد Authorization در هدر برابر زیر خواهد شد :

Basic aXV5cml3eTg4OmpoczY1ZGZn

نمونه ریکوئست این سرویس به صورت زیر است :

curl --location --request POST 'https://uat.mydigipay.info/digipay/api/oauth/token' \
--header 'Authorization: Basic aXV5cml3eTg4OmpoczY1ZGZn' \
--form 'username=sampleUsername' \
--form 'password=samplePassword' \
--form 'grant_type=password'
درصورتی که اطلاعات ارسالی صحیح باشد کد http ریسپانس این سرویس برابر 200 و در صورتی که اطلاعات نامعتبر باشد برابر 401 خواهد بود. ریسپانس موفق این سرویس شامل فیلد های زیر است :

نوع	توضیح	مثال	نام پارامتر
string	توکن اصلی	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXV	access_token
string	رفرش توکن	G9yaXRpZXMiOiItMTAxLDAsLTEsLTI1MS	refresh_token
string	نوع توکن	bearer	token_type
int	زمان منقضی شدن توکن اصلی
به ثانیه	3599	expires_in
جدول 2– پارامتر های پاسخ سرویس لاگین

نمونه ای از پاسخ این سرویس در قالب json به صورت زیر است :

{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6Ikxxx",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6xxxx",
  "expires_in": 3599,
  "scope": "USER WALLET_BUSINESS_INTEGRATION BUSINESS_API test Permission_Test",
  "jti": "RkuR_-p7mSP4VJzYrxZpRvGI5ww"
}
فیلد expires_in نشان میدهد که توکن اصلی تا چه مدت زمانی معتبر است. در صورتی که این زمان به صورت کامل سپری شود، توکن اصلی منقضی میشود و باید دوباره سرویس فراخوانی و از توکن جدید استفاده نمود.

ازین پس مقدار فیلد access_token را میتوان در فراخوانی سرویس های دیگر دیجی پی استفاده نمود. این فیلد به همراه پیشوند Bearer در هدر Authorization ریکوئست قرار میگیرد.

برای مثال، یک نمونه از فراخوانی وب سرویس با توکن به این صورت می باشد:

curl --location 'https://uat.mydigipay.info/digipay/api/tickets/business?type=11' \
--header 'Agent: WEB' \
--header 'Digipay-Version: 2022-02-02' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9xxxx' \
--data '{
    "cellNumber": "09103119100",
    "amount": 10000,
    "providerId": 811143348,
    "callbackUrl": "https://www.digikala.com"
}'

درصورتی که توکن منقضی شده باشد و یا معتبر نباشد، کد ریسپانس http فراخوانی وب سرویس با این توکن برابر 401 خواهد شد.

۵. تیکت خرید
این سرویس به‌منظور ایجاد تیکت خرید فراخوانی می‌شود. ورودی‌های این سرویس شامل: amount، cell number، redirect url و غیره می‌باشد. در پاسخ payUrl ارسال می‌شود. این نشانی کاربر را به صفحه ادامه فرایند پرداخت و تکمیل خرید هدایت می‌کند.

digipay/api/tickets/business	آدرس سرویس تیکت خرید
POST	متد سرویس
۱-۵. پارامترها
جدول پارامترهای کوئری به شرح زیر است:

توضیحات	نوع تیکت به عدد
برای تمام فیچر‌های روی UPG	۱۱
جدول ۳– Query Parameters

۲-۵. هدرهای سرویس
جدول هدر HTTP به شرح زیر است:

توضیحات	فیلد
توکن بدست آمده در مرحله لاگین	Authorization
Must be application/json; charset=UTF-8	Content-Type
'WEB'	Agent
باید در قالب این فرمت باشد : 02-02-2022	Digipay-Version
جدول ۴- HTTP Headers

۳-۵. فیلدهای درخواست
جدول فیلد درخواست ها به شرح زیر است :

توضیحات	نوع داده	اجباری	نام فیلد
مبلغ خرید	Long	بله	amount
شماره همراه کاربر	String	بله	cellNumber
ایدی یونیک که از سمت شما برای این خرید ثبت می شود.	String	بله	providerId
آدرس برگشت به سایت پذیرنده	String	بله	callbackUrl
این فیلد صرفا برای خریدهای اعتباری و اقساطی اجباری است.	Object	مرتبط با نوع سرویس	basketDetailsDto
این فیلد برای خرید های تسهیمی یا خرید هایی که
مبلغ آن به چند قسمت تقسیم و به حساب های
مختلف واریز می شوند اجباری می باشد در غیر
این صورت باید خالی بماند .

نکته : حداکثر سایز این لیست 2 می باشد.		بستگی دارد	splitDetailsList
توضیحات در بخش ۴-۵-۴	Map	خیر	additionalInfo
جدول ۵- Request Fields

مقدار	توضیحات
0	پرداخت Wallet
2	پرداخت IPG
جدول 6- Preferred Gateway

۱-۳-۵. جزییات سبد خرید
جدول جزییات سبد خرید به شرح زیر است:

توضیحات	نوع داده	نام فیلد
آیدی یونیک به ازای هر سبد خرید	String	basketId
لیستی از موارد درون سبد	Object	items
جدول 7- Basket Detail

جدول آیتم های مربوط به جزییات سبد خرید به شرح زیر است:

توضیحات	نوع داده	نام فیلد
شناسه فروشنده	String	sellerId
شناسه تامین کننده	String	supplierId
کد محصول	String	productCode
شناسه برند	String	brand
نوع کالا که باید نوع آن براساس جدول زیر انتخاب شود.	integer	productType
تعداد کالا	integer	count
دسته بندی	String	categoryId
جدول 8- Basket Detail Item

کد	نوع
1	بادوام
2	مصرفی
3	سرویس(خدمات)
4	مصرفی بادوام
جدول 9- Product Type

توضیحات	نوع
موبایل	Mobile
لپ تاپ	laptop
تبلت	tablet
کنسول بازی	gameconsole
جدول 10- Category

۲-۳-۵. جزییات تسهیم
این امکان برای مواقعی است که کاربر خرید خود را به همراه امکان بیمه نمودن کالا و یا دریافت اشتراک دیجی پلاس انجام می‌دهد. به‌طورکلی دو نوع پرداخت تسهیمی وجود دارد، پرداخت تسهیمی بیمه که در حالتی است که کاربر تمایل دارد کالای خود را بیمه کند و پرداخت تسهیمی ساده در مواردی است که کاربر تمایل به دریافت اشتراک دیجی پلاس هم داشته باشد.

توضیحات	نوع داده	اجباری	نام فیلد
نوع تسهیم	String	بله	type
نام کاربری که مبلغی از تسهیم به آن اختصاص داده می شود.	String	بله	username
مبلغ تسهیم	Long	بله	amount
اگر نوع تسهیم بیمه باشد این فیلد اجباری می باشد.	<List<Object	بستگی دارد	policies
اگر نوع تسهیم بیمه باشد این فیلد اجباری می باشد.	Object	بستگی دارد	policyHolder
جدول 11- Split Detail

توضیحات	نوع
برای تسهیم عادی	simple
برای تسهیم بیمه	insurance
جدول 12- Split Type

توضیحات	نوع داده	اجباری	نام فیلد
آیدی محصول	String	خیر	id
گونه	String	بله	variantId
دسته بندی محصولات که براساس جدول زیر باید پر شود	String	بله	category
برند محصول	String	بله	brand
مدل محصول	String	بله	model
شماره سریال محصول	String	خیر	serialNo
قیمت محصول	Long	بله	price
قیمت با تخفیف (باید مساوی یا کمتر از مبلغ اصلی باشد)	Long	خیر	priceWithDiscount
جدول 13- Policies

توضیحات	نوع داده	اجباری	نام فیلد
کدملی خریدار	String	No	nationalCode
نام	String	Yes	firstName
نام خانوادگی	String	Yes	lastName
شماره تلفن	String	Yes	cellNumber
آیا کاربر دیجی پلاس می باشد.	Boolean	No	digiPlusCustomer
کد پستی	String	No	postCode
آدرس پستی	String	Yes	address
جدول 14- Policy Holder

۴-۵. فیلدهای پاسخ
جدول Response Fileds به شرح زیر است:

توضیحات	نوع داده	نام فیلد
آدرسی که از طریق آن کاربر به درگاه پرداخت دیجی پی ریدایرکت میشود.	String	redirectUrl
تیکت ساخته شما برای این خرید	String	ticket
کد عددی برای وضعیت نتیجه ریسپانس	Integer	result.status
پیامی برای توصیف وضعیت نتیجه ریسپانس	String	result.message
---------	String	result.level
اگر ریکوئست دارای تسهیم بیمه باشد این فیلد از طریق دیتای ورودی پر میشود.	Object	insurancePolicies
جدول ۱5- Response Fields

توضیحات	نام فیلد
کد بیمه	id
شناسه پیش نویس بیمه نامه	policyDraftNo
جدول 16-Insurance Policies

۵-۵. نمونه درخواست HTTP
۱-۵-۵. نمونه درخواست HTTP برای پرداخت Credit یا BNPL
نمونه درخواست HTTPبرای ریکوئست دریافت تیکت در فیچرهای BNPL یا Credit به شرح زیر می باشد:

curl --location --request POST '/digipay/api/tickets/business?type=11' \
--header 'Agent: WEB' \
--header 'Digipay-Version: 2022-02-02' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' \
--header 'Content-Type: application/json' \
--data-raw '{

  "cellNumber" : "09190070450",
  "amount" : 100000000,
  "providerId" :"-1106111147",
  "callbackUrl" : "http://example.com",
  "basketDetailsDto": {
    "items": [
      {
        "sellerId": "seller-id",
        "supplierId": "supplier-id",
        "productCode": "product-code",
        "brand": "brand",

    "productType": 1,
        "count": 1,
        "categoryId": "category-id"
      }
    ],
    "basketId": "basket-id"
  }
}'

۲-۵-۵. نمونه درخواست HTTP برای پرداخت IPG یا Wallet
نمونه ریکوئست درخواست تیکت برای خرید های wallet و درگاه پرداخت به شرح زیر می باشد :

curl --location --request POST '/digipay/api/tickets/business?type=11' \
--header 'Agent: WEB' \
--header 'Digipay-Version: 2022-02-02' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' \
--header 'Content-Type: application/json' \
--data-raw '{
    "cellNumber": "09303030875",
    "amount": 10000,
    "providerId": "32111",
    "callbackUrl": "http://example.com"
    }'
۳-۵-۵. نمونه درخواست HTTP برای فیچرهای تسهیمی
نمونه ریکوئست درخواست تیکت برای فیچرهای تسهیمی به شرح زیر می باشد:

url --location --request POST '/digipay/api/tickets/business?type=11' \
--header 'Agent: WEB' \
--header 'Digipay-Version: 2022-02-02' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' \
--header 'Content-Type: application/json' \
--data-raw '{

  "cellNumber" : "09190070450",
  "amount" : 100000,
  "providerId" :"-1106111147",
  "callbackUrl" : "http://example.com",
  "splitDetailsList": [
    {
      "type": "simple",
      "amount": 21800,
      "username": "dk"
    },
    {
      "type": "insurance",
      "amount": 2180000,
      "policies": [
          {
              "id": "1",
              "brand": "DOX",
              "model": "DOX",
              "price": 100000000,
              "category": "Mobile",
              "serialNo": null,
              "variantId": "37633302",
              "priceWithDiscount": 100000000,
              "product_warranty_id": 498
          }
      ],
      "policyHolder": {
          "address": "اباذر، بلوار فر",
          "lastName": "last1038214",
          "postCode": "1471656341",
          "firstName": "first1038214",
          "cellNumber": "09390054003",
          "nationalCode": "8085700281",
          "digiPlusCustomer": false
      }
    }
  ]
}'
4-۵-۵. نمونه درخواست HTTP برای خرید بدون نمایش صفحه‌ی انتخاب ابزار پرداخت
برای زمانی که نیازی به نمایش صفحه‌ی انتخاب ابزار پرداخت ندارید و می‌خواهید کاربر خود را مستقیما به درگاه خاصی بفرستید،‌ باید مقدار فیلد preferredGateway را مطابق جدول ۶ معادل با درگاه مورد نیاز خود پر کنید.

نمونه درخواست HTTP برای درخواست تیکت مستقیم IPG به شرح زیر است:

curl --location 'https://uat.mydigipay.info/digipay/api/tickets/business?type=11' \
--header 'Agent: WEB' \
--header 'Digipay-Version: 2022-02-02' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInRasdddXVCJ9' \
--data '{
    "cellNumber": "09335292905",
    "amount": 10000,
    "providerId": 811165310,
    "callbackUrl": "https://example.com",
    "additionalInfo": {
        "preferredGateway": 2
    }
}'

نمونه درخواست HTTP برای درخواست تیکت مستقیم Wallet به شرح زیر است:

location 'https://uat.mydigipay.info/digipay/api/tickets/business?type=11' \
--header 'Agent: WEB' \
--header 'Digipay-Version: 2022-02-02' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInRasdddXVCJ9' \
--data '{
    "cellNumber": "09335292905",
    "amount": 10000,
    "providerId": 811165310,
    "callbackUrl": "https://example.com",
    "additionalInfo": {
        "preferredGateway": 0
    }
}'
6-۵. نمونه پاسخ HTTP
6-4-۵.نمونه پاسخ درخواست تیکت
نمونه پاسخ HTTP برای درخواست تیکت به شرح زیر است:

HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{
    "result": {
        "title": "SUCCESS",
        "status": 0,
        "message": "عملیات با موفقیت انجام شد",
        "level": "INFO"
    },
    "ticket": "v2:ab17ec383d654be3b009f9fc45202f80",
    "redirectUrl": "https://uatweb.mydigipay.info/web-pay/tgs/v2:ab17ec383d654be3b009f9fc45202f80"
}
6-4-2. نمونه پاسخ درخواست های دارای جزییات تسهیمی

نمونه پاسخ درخواست های HTTP که دارای جزیییات تسهیمی می باشد به شرح زیر است:

HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{
    "result": {
        "title": "SUCCESS",
        "status": 0,
        "message": "عملیات با موفقیت انجام شد",
        "level": "INFO"
    },
    "ticket": "v2:ab17ec383d654be3b009f9fc45202f80",
    "redirectUrl": "https://uatweb.mydigipay.info/web-pay/tgs/v2:ab17ec383d654be3b009f9fc45202f80",
    "insurancePolicies": [
        {
            "id": "1",
            "policyDraftNo": "1059488"
        }
    ]
}

۶. نتیجه پرداخت
در صورتی که وارد درگاه‌های پرداخت شود (خرید به صورت اعتباری و یا (IPG، نتیجه پرداخت با یک درخواست به حالت POST به سمت RedirectURL پذیرنده ارسال می شود.

توضیحات	اجباری	نوع داده	نام فیلد
مبلغ خرید	بله	Long	amount
آیدی یونیک که از سمت شما برای خرید ثبت شده است.	بله	String	providerId
کد پیگیری مربوط به این خرید	بله	String	trackingCode
Rrn مربوط به خرید های IPG	خیر	String	rrn
کد درگاه خرید اینترنتی اگر خرید از نوع IPG باشد	خیر	Object	psp
آیا خرید کردیتی بوده است یا خیر	خیر	Boolean	isCredit
وضعیت پرداخت:موفق(SUCCESS) و ناموفق(FAILURE)	بله	String	result
نوع خرید یا تایپ که میتوان براساس آن تایید پرداخت و سرویس بازگشت وجه
را کال کرد	بله	Integer	type
جدول ۱7-Response Fields

نوع	TYPE کد
IPG	0
WALLET	11
CREDIT	5
BNPL(Buy Now Pay Later)	13
CREDIT-CARD	24
جدول ۱8- Types

نام PSP	کد
SAMAN	001
PARSIAN	002
MELLAT	003
ENOVIN	004
PASARGAD	005
FANAVA	006
MELLI	007
IRKISH	008
جدول ۱9- PSP Names

۷. تایید پرداخت
Warning Icon ️
لطفاً قبل از آغاز فرآیند تأیید پرداخت، مقادیر amount (مبلغ خرید) و providerId (آیدی یونیک که از سمت شما برای خرید ثبت شده است) ارسال شده از نتیجه پرداخت را با دقت بررسی کرده و با اطلاعات تراکنش ثبت شده در سیستم خود تطبیق دهید. این اقدام از بروز خطاها در روند تأیید پرداخت جلوگیری می کند.
مرحله تایید پرداخت زمانی به کار برده میشود که وضعیت خرید موفق بوده و اگر آن را تایید نکنید پس از زمان مشخصی به طور خودکار پرداخت لغو و مبلغ مرجوع خواهد شد.

/digipay/api/purchases/verify	آدرس سرویس تیکت خرید
POST	متد سرویس
1-۷ فیلدهای درخواست
جدول فیلدهای درخواست به شرح زیر است:

توضیحات	نوع فیلد	اجباری	نام فیلد
کدرهگیری خرید	String	بله	trackingCode
شناسه ارسال شده در دریافت تیکت خرید	String	بله	providerId
جدول 20– فلیدهای درخواست

2-۷. پارامترها
جدول پارامترهای کویری به شرح زیر است:

توضیحات	نام فیلد
type	نوع تیکت برای خرید موردنظر
جدول 21– Query Parameters

نوع	TYPE کد
IPG	0
WALLET	11
CREDIT	5
BNPL(Buy Now Pay Later)	13
CREDIT-CARD	24
جدول 22– Ticket Types

3-۷. هدرهای سرویس
جدول هدر HTTP به شرح زیر است:

توضیحات	فیلد
توکن بدست آمده در مرحله لاگین	Authorization
Must be application/json; charset=UTF-8	Content-Type
جدول 23– Http Header

4-۷. پاسخ سرویس
توضیحات	نوع داده	اجباری	نام فیلد
کد پیگیری مربوط به این خرید	String	Yes	trackingCode
آیدی یونیک که از سمت شما برای خرید ثبت شده است	String	Yes	providerId
شماره ترمینال در حالتی که خرید IPG باشد	String	No	terminalId
Rrn مربوط به خرید های IPG	String	No	rrn
شماره کارت کاربر به صورت مختصر شده	String	No	maskedPan
کد درگاه خرید اینترنتی اگر خرید از نوع IPG باشد	String	No	pspCode
نام درگاه خرید اینترنتی اگر خرید از نوع IPG باشد	String	No	pspName
کد تامین کننده اعتبار	String	No	fpCode
نام تامین کننده اعتبار	String	No	fpName
مبلغ خرید	String	Yes	amount
نوع درگاه خرید	Enum	Yes	paymentGateway
اطلاعات دقیق تری از خرید (اگر خرید از نوع اعتباری یا اقساطی
باشد)	Object	No	additionalInfo
کد عددی برای وضعیت نتیجه ریسپانس	*Integer	Yes	result.status
پیامی برای توصیف وضعیت نتیجه ریسپانس	*String	Yes	result.message
---------	*String	Yes	result.level
جدول 24– Response Fields

توضیحات	کد
IPG	0
WALLET	3
CPG(اعتباری)	4
جدول 25– PaymentGateway Types

توضیحات	نوع داده	نام فیلد
prepayment + feeCharge	long	prepaymentAmount
مبلغ نقدی	long	cashAmount
مبلغ اعتباری	long	creditAmount
آیا قرارداد کاربر فاینال شده است یا خیر؟	Boolean	instantFinalization
ایجاد فاکتور	Boolean	generateInvoice
جدول 26– additional info

5-۷. نمونه درخواست ارسالی سرویس
curl --location --request POST '/digipay/api/purchases/verify?type=5' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ'\
--header 'Content-Type: application/json'
--data-raw '{
    "trackingCode": "10357963991735727353649",
    "providerId": "9345622059488682121"
}'
۶-۷. نمونه پاسخ دریافتی سرویس
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{
    "result": {
        "status": 0,
        "message": "عملیات با موفقیت انجام شد",
        "level": "INFO"
    },
    "trackingCode": "19259313601650191846745",
    "providerId": "132713002000200010",
    "fpCode": "7",
    "fpName": "DIGIPAY",
    "amount": 200000,
    "paymentGateway": 4,
    "additionalInfo": {
        "prepaymentAmount": 0,
        "cashAmount": 0,
        "creditAmount": 200000,
        "instantFinalization": false,
        "generateInvoice": false
    }
}
۸. بازگشت وجه خرید به صورت دستی
این مرحله برای زمانی که خرید توسط شما تایید(VERIFY) می شود و کمتر از 25 دقیقه قصد انجام بازگشت وجه و ابطال خرید را دارید.

• نکته: مرحله بازگشت وجه دستی صرفا برای خرید های از طریق فیچرهای IPG و DPG امکان پذیر است و برای بقیه فیچرها درحال حاضر این امکان وجود ندارد.

• نکته: به ازای هر خرید یکی از مراحل refund یا manual reverse را میتوان کال کرد.

/digipay/api/reverse	آدرس سرویس تیکت خرید
POST	متد سرویس
۱-۸. پارامترها
جدول پارامترهای کویری به شرح زیر است:

توضیحات	نام فیلد
type	نوع تیکت برای خرید موردنظر
جدول 27– Query Parameters

نوع	TYPE کد
IPG	0
WALLET	11
CREDIT	5
BNPL(Buy Now Pay Later)	13
CREDIT-CARD	24
جدول 28– Ticket Types

۲-۸. هدرهای سرویس
جدول هدر HTTP به شرح زیر است:

توضیحات	فیلد
توکن بدست آمده در مرحله لاگین	Authorization
Must be application/json; charset=UTF-8	Content-Type
جدول 29– Http Header

۳-۸. فیلدهای درخواست
توضیحات	نوع داده	اجباری	نام فیلد
کد پیگیری خرید	String	Yes	trackingCode
آیدی یونیک که از سمت شما به ازای این خرید ثبت شده است	String	Yes	providerId
جدول 30– Request Fields

۴-۸. فیلدهای پاسخ
توضیحات	نوع داده	نام فیلد
کد پیگیری مربوط به این خرید	String	trackingCode
آیدی یونیک که از سمت شما برای خرید ثبت شده است	String	providerId
Rrn مربوط به خرید های IPG	String	rrn
شماره کارت کاربر به صورت مختصر شده	String	maskedPan
مبلغ خرید	String	amount
'IPG ⇒ '0' or DPG ⇒ '1	Enum	paymentGateway
کد عددی برای وضعیت نتیجه ریسپانس	Integer	result.status
پیامی برای توصیف وضعیت نتیجه ریسپانس	String	result.message
---------	String	result.level
جدول 31– Response Fields

۵-۸. نمونه درخواست ارسالی سرویس
curl --location --request POST '/digipay/api/reverse' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' \
--header 'Content-Type: application/json' \
--data '{
    "purchaseTrackingCode": "571*********98",
    "providerId": "{{purchaseProviderId}}"
}'
۶-۸. نمونه پاسخ دریافتی سرویس
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{
    "result": {
        "status": 0,
        "message": "عملیات با موفقیت انجام شد",
        "level": "INFO"
    },
    "providerId": "{{purchaseProviderId}}",
    "trackingCode": "571000000098",
    "rrn": "**********************",
    "maskedPan": "**********************",
    "amount": 56547774478,
    "paymentGateway": 0
}
۹. تحویل خرید
این مرحله زمانی انجام می شود که همه مراحل مورد نیاز قبلی انجام شده باشد و در زمانی که آن کالا یا خدمات به مشتری داده شده باشد.

• نکته: این مرحله باید فقط برای پرداخت های اعتباری که شامل CREDIT و BNPL می باشد انجام شود.

digipay/api/purchases/deliver	آدرس سرویس تیکت خرید
POST	متد سرویس
۱-۹. پارامترها
جدول پارامترهای کویری به شرح زیر است:

توضیحات	نام فیلد
type	نوع تیکت برای خرید موردنظر
جدول 32– Query Parameters

نوع	TYPE کد
IPG	0
WALLET	11
CREDIT	5
BNPL(Buy Now Pay Later)	13
CREDIT-CARD	24
جدول 33– Ticket Types

۲-۹. هدرهای سرویس
جدول هدر HTTP به شرح زیر است:

توضیحات	فیلد
توکن بدست آمده در مرحله لاگین	Authorization
Must be application/json; charset=UTF-8	Content-Type
جدول 34– Http Header

۳-۹. فیلدهای درخواست
توضیحات	نوع داده	اجباری	نام فیلد
زمان تحویل کالا	Date	Yes	deliveryDate
شماره فاکتور تحویل کالا	String	Yes	invoiceNumber
کد پیگیری خرید تحویل داده شده	String	Yes	trackingCode
لیست محصولات تحویل داده شده	List< String >	Yes	products
جدول 35– Request Fields

۴-۹. فیلدهای پاسخ
توضیحات	نوع داده	نام فیلد
کد عددی برای وضعیت نتیجه ریسپانس	Integer	result.status
پیامی برای توصیف وضعیت نتیجه ریسپانس	String	result.message
---------	String	result.level
جدول 36– Response Fields

۵-۹. نمونه درخواست ارسالی سرویس
curl --location --request POST '/digipay/api/purchases/deliver?type=5' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' \
--header 'Content-Type: application/json' \
--data-raw '{
    "deliveryDate": 1592502763000,
    "invoiceNumber": "7471288365484",
    "trackingCode": "5239470511667728782510",
    "products": [
        "product-4",
        "product-5",
        "product-6",
        "product-7"
    ]
}'
۶-۹. نمونه پاسخ دریافتی سرویس
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{
    "result": {
        "status": 0,
        "message": "عملیات با موفقیت انجام شد",
        "level": "INFO"
    }
}
۱۰. بازگشت خرید
این مرحله برای بازگشت وجه مبلغ خرید به کاربر استفاده می شود.

digipay/api/refunds?type={ticket-type}	آدرس سرویس تیکت خرید
POST	متد سرویس
۱-۱۰. پارامترها
جدول پارامترهای کویری به شرح زیر است:

توضیحات	نام فیلد
type	نوع تیکت برای خرید موردنظر
جدول 37– Query Parameters

نوع	TYPE کد
IPG	0
WALLET	11
CREDIT	5
BNPL(Buy Now Pay Later)	13
CREDIT-CARD	24
جدول 38– Ticket Types

۲-۱۰. هدرهای سرویس
جدول هدر HTTP به شرح زیر است:

توضیحات	فیلد
توکن بدست آمده در مرحله لاگین	Authorization
Must be application/json; charset=UTF-8	Content-Type
جدول 39– Http Header

۳-۱۰. فیلدهای درخواست
توضیحات	نوع داده	اجباری	نام فیلد
یک آیدی بی همتا (unique) برای بازگشت وجه متفاوت از
آیدی خرید.	String	Yes	providerId
میزان مبلغی که میخواهید به کاربر عودت داده شود.	Long	Yes	amount
کد پیگیری خرید مورد نظر که میخواهید عودت داده شود.(این فیلد برابر trackingCode در تراکنش خرید است)	String	Yes	saleTrackingCode
جدول 40– Request Fields

۴-۱۰. فیلدهای پاسخ
توضیحات	نوع داده	نام فیلد
کد پیگیری مربوط به بازگشت وجه	String	trackingCode
عنوانی برای نتیجه ریسپانس	String	result.title
کد عددی برای وضعیت نتیجه ریسپانس	Integer	result.status
پیامی برای توصیف وضعیت نتیجه ریسپانس	String	result.message
---------	String	result.level
جدول 41– Response Fields

۵-۱۰. نمونه درخواست ارسالی سرویس
curl --location --request POST '/digipay/api/refunds?type=0
' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' \
--header 'Content-Type: application/json' \
--data-raw '{
    "providerId": 1592502763000,
    "amount": "7471288365484",
    "saleTrackingCode": "5239470511667728782510"
        "product-4"
}'
۶-۱۰. نمونه پاسخ دریافتی سرویس
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{
    "result": {
        "title" : "SUCCESS",
        "status": 0,
        "message": "عملیات با موفقیت انجام شد",
        "level": "INFO"
    },
    "trackingCode": "571000000098"
}
۱۱. پیگیری خرید عودت داده شده
از این سرویس برای پیگیری خرید عودت داده شده استفاده می شود.

digipay/api/refunds/{InquiryId}	آدرس سرویس تیکت خرید
POST	متد سرویس
توضیحات	نام فیلد
کد پیگیری یا providerId مربوط به ریفاند	InquiryId
۱-۱۱. پارامترها
جدول پارامترهای کویری به شرح زیر است:

توضیحات	نام فیلد
type	نوع تیکت برای خرید موردنظر
Must be application/json; charset=UTF-8	Content-Type
جدول 42– Query Parameters

نوع	TYPE کد
IPG	0
WALLET	11
CREDIT	5
BNPL(Buy Now Pay Later)	13
CREDIT-CARD	24
جدول 43– Ticket Types

۲-۱۱. هدرهای سرویس
جدول هدر HTTP به شرح زیر است:

توضیحات	فیلد
توکن بدست آمده در مرحله لاگین	Authorization
Must be application/json;charset=UTF-8	Content-Type
جدول 44– Http Header

۳-۱۱. فیلدهای پاسخ
توضیحات	نوع داده	نام فیلد
کد پیگیری مربوط به این خرید	String	providerId
آیدی یونیک که از سمت شما برای خرید ثبت شده است	String	trackingCode
وضعیت ریفاند(توضیحات دقیق تر در جدول ذیل ذکر شده است.)	Integer	status
کد عددی که اگر ریفاند با خطا روبرو شده باشد	Integer	resultCode
تاریخ عودت وجه در قالب Epoch	String	transferDate
نوع مقصد ریفاند	Integer	destinationType
اگر نوع مقصد IBAN یا PAN باشد این فیلد پر میشود.	String	destination
عنوانی برای نتیجه ریسپانس	String	result.title
کد عددی برای وضعیت نتیجه ریسپانس	Integer	result.status
پیامی برای توصیف وضعیت نتیجه ریسپانس	String	result.message
---------	String	result.level
جدول 45– Response Fields

نوع	کد
Masked PAN	0
IBAN	1
Wallet	2
Credit	3
جدول 46– Destintion Types

توضیحات	کد
موفق	0
ناموفق	1
عدم وضعیت مشخص
نیاز به پیگیری کردن دوباره	2
جدول 47– Result.statu

۱۲. کدهای پاسخ HTTP
توضیحات	کد
موفق	200
پارامترهای ورودی نامعتبر است.	400
خطا در احراز هویت و دسترسی	۴۰۱,۴۰۳
خطای بیزینسی مطابق جدول ۴۷	۴۲۲
خطای داخلی	۵۰۰
جدول 48– HTTP Rsponse code

توضیحات	کد
عملیات با موفقیت انجام شد	0
اطلاعات ورودی اشتباه می باشد	1054
اطلاعات خرید یافت نشد	9000
توکن پرداخت معتبر نمی باشد	9001
خرید مورد نظر منقضی شده است	9003
خرید مورد نظر درحال انجام است	9004
خرید قابل پرداخت نمی باشد	9005
خطا در برقراری ارتباط با درگاه پرداخت	9006
خرید با موفقیت انجام نشده است	9007
این خرید با داده های متفاوتی قبلا ثبت شده است	9008
محدوده زمانی تایید تراکنش گذشته است	9009
تایید خرید ناموفق بود	9010
نتیجه تایید خرید نامشخص است	9011
وضعیت خرید برای این درخواست صحیح نمی باشد	9012
ورود شماره همراه برای کاربران ثبت نام شده الزامی است	9030
اعطای تیکت برای کاربر مورد نظر امکان پذیر نمی‌باشد	9031
جدول 49– Body of error code (422)