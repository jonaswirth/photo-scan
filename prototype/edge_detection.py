import numpy as np
import cv2 as cv
import matplotlib.pyplot as plt

#Detecting the edges:
# 1. convert to B/W
# 2. canny edge
# 3. hough lines
# 4. kmeans => 4 clusters

def main():
    # Read image, convert from BGR to RGB
    img = cv.imread("../public/test_doc.png")
    img = cv.cvtColor(img, cv.COLOR_BGR2RGB)
    plt.imshow(img)
    plt.show()

    ## Convert to B/W
    img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    plt.imshow(img, cmap="gray")
    plt.show()

    ## TODO: Dilate image to get rid of noise in the background and potential text on the document?
    
    ret, img = cv.threshold(img, 0, 255, cv.THRESH_BINARY+cv.THRESH_OTSU)

    ## TODO: How to verify if otsu thresholding worked? If background is not different enough it might worsen the result?

    plt.imshow(img, cmap="gray")
    plt.show()

    ## Canny edge
    img = cv.Canny(img, 50, 200, None, 3)

    plt.imshow(img, cmap="gray")
    plt.show()

if __name__ == "__main__":
    main()