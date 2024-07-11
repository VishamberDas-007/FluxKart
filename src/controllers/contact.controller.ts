import { Request, Response } from "express";
import {
	CONTACT_E_0001,
	CONTACT_S_0001,
	CONTACT_S_0002,
} from "../config/responseCode/contact";
import prisma from "../db";
import { TContactIdentifyResult } from "./types/contact";
import { Contact } from "@prisma/client";

export const identifyContact = async (req: Request, res: Response) => {
	try {
		const { email, phoneNumber }: { email?: string; phoneNumber?: number } =
			req.body;

		const emailLowerCase = email?.toLowerCase();
		let emailMatchData: Contact | undefined,
			phoneNumberMatchData: Contact | undefined;
		const result: TContactIdentifyResult = {
			contact: {
				emails: [],
				phoneNumbers: [],
				primaryContactId: 0,
				secondaryContactIds: [],
			},
		};

		if (emailLowerCase) {
			emailMatchData = await prisma.contact.findFirst({
				where: {
					email: emailLowerCase,
				},
			});
		}
		if (phoneNumber) {
			phoneNumberMatchData = await prisma.contact.findFirst({
				where: {
					phoneNumber: phoneNumber.toString(),
				},
			});
		}

		if (!emailMatchData && !phoneNumberMatchData) {
			await prisma.contact.create({
				data: {
					email: emailLowerCase,
					phoneNumber: phoneNumber?.toString(),
					linkPrecedence: "primary",
				},
			});
		} else if (
			(emailLowerCase && !emailMatchData) ||
			(phoneNumber && !phoneNumberMatchData)
		) {
			await prisma.contact.create({
				data: {
					email: emailLowerCase,
					phoneNumber: phoneNumber?.toString(),
					linkPrecedence: "secondary",
					linkedId:
						emailMatchData?.linkPrecedence === "primary"
							? emailMatchData.id
							: phoneNumberMatchData.id,
				},
			});
		} else if (
			emailMatchData &&
			phoneNumberMatchData &&
			emailMatchData.id !== phoneNumberMatchData.id
		) {
			await prisma.$transaction(async (prisma) => {
				await prisma.contact.update({
					where: {
						id: emailMatchData.id,
					},
					data: {
						linkPrecedence: "primary",
						linkedId: null,
					},
				});

				await prisma.contact.update({
					where: {
						id: phoneNumberMatchData.id,
					},
					data: {
						linkPrecedence: "secondary",
						linkedId: emailMatchData.id,
					},
				});
			});
		}

		const contactData = await prisma.contact.findFirst({
			where: {
				OR: [
					{
						email: emailLowerCase,
					},
					{
						phoneNumber: phoneNumber?.toString(),
					},
				],
			},
			include: {
				children: true,
				parent: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		if (contactData.linkPrecedence === "primary") {
			result.contact.primaryContactId = contactData.id;
			!result.contact.emails.includes(contactData.email) &&
				result.contact.emails.unshift(contactData.email);
			!result.contact.phoneNumbers.includes(contactData.phoneNumber) &&
				result.contact.phoneNumbers.unshift(contactData.phoneNumber);
		} else {
			result.contact.secondaryContactIds.push(contactData.id);
			contactData.email &&
				!result.contact.emails.includes(contactData.email) &&
				result.contact.emails.push(contactData.email);
			contactData.phoneNumber &&
				!result.contact.phoneNumbers.includes(contactData.phoneNumber) &&
				result.contact.phoneNumbers.push(contactData.phoneNumber);
		}

		contactData.children.forEach((element) => {
			result.contact.secondaryContactIds.push(element.id);
			element.email &&
				!result.contact.emails.includes(element.email) &&
				result.contact.emails.push(element.email);
			element.phoneNumber &&
				!result.contact.phoneNumbers.includes(element.phoneNumber) &&
				result.contact.phoneNumbers.push(element.phoneNumber);
		});

		if (contactData.parent) {
			result.contact.primaryContactId = contactData.parent.id;
			!result.contact.emails.includes(contactData.parent.email) &&
				result.contact.emails.unshift(contactData.parent.email);
			!result.contact.phoneNumbers.includes(contactData.parent.phoneNumber) &&
				result.contact.phoneNumbers.unshift(contactData.parent.phoneNumber);
		}

		return res.status(CONTACT_S_0001.statusCode).json({
			...CONTACT_S_0001,
			data: result,
		});
	} catch (error) {
		throw new Error("Error occured while identifyng the contact");
	}
};
